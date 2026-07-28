import { EventEmitter } from 'events';
import { Socket } from 'net';
import { Packet } from './packet';
import { DEFAULT_PACKET_MAP, PacketMap } from './packet-map';
import { PacketType } from './packet-type';
import { Reader } from './reader';
import { Writer } from './writer';
import { createPacket } from './create-packet';
import { INCOMING_KEY, OUTGOING_KEY, RC4 } from './crypto/rc4';
import { RealmlibError } from './errors';
import { PacketFieldProbe, probePacketFields } from './debug';
import { getPacketDefinitionById, PacketDirection } from './packet-registry';

/**
 * The configuration for the RC4 ciphers used by this PacketIO
 */
export interface RC4Config {
  incomingKey: string;
  outgoingKey: string;
}

export interface PacketIOOptions {
  socket?: Socket;
  rc4?: RC4Config;
  packetMap?: PacketMap;
  /**
   * Protocol direction represented by numeric ids received from the socket.
   * Set this to `outgoing` for the client-to-server side of a proxy.
   */
  incomingDirection?: WirePacketDirection;
  /**
   * Protocol direction represented by numeric ids written to the socket.
   * Set this to `incoming` for the server-to-client side of a proxy.
   */
  outgoingDirection?: WirePacketDirection;
  /** Maximum typed/raw packets waiting behind the current socket write. */
  maxOutgoingQueue?: number;
}

export type WirePacketDirection = Exclude<PacketDirection, 'unknown'>;
export type PacketIOConnectionState =
  | 'detached'
  | 'connecting'
  | 'connected'
  | 'backpressured'
  | 'closed';

export type SendStatus =
  | 'sent'
  | 'queued'
  | 'disconnected'
  | 'missing-mapping'
  | 'queue-full'
  | 'invalid';

export interface SendResult {
  readonly accepted: boolean;
  readonly status: SendStatus;
  /** Number of packets still waiting after this call. */
  readonly queueSize: number;
}

/**
 * The payload of the `rawPacket` debug event: the deciphered bytes of an
 * incoming packet along with its id and mapped type (if any).
 */
export interface RawPacket {
  /** The numeric packet id. */
  id: number;
  /** The mapped packet type, or `undefined` if the id is not in the map. */
  type: PacketType | undefined;
  /** The deciphered packet body (everything after the 5 byte header). */
  payload: Buffer;
  /** Total packet size including the five-byte frame header. */
  size: number;
  readonly direction: 'incoming';
}

/**
 * The payload of raw outgoing packet debug events.
 */
export interface RawOutgoingPacket extends Omit<RawPacket, 'direction'> {
  /** Total packet size including the 5 byte header. */
  size: number;
  readonly direction: 'outgoing';
}

export interface PacketDiagnostic extends RawPacket {
  status: 'unknown' | 'unimplemented' | 'parsed' | 'parse-error' | 'leftover' | 'opaque';
  /** Bytes consumed from the packet body. */
  offset: number;
  /** Bytes left after parsing stopped. */
  remaining: number;
  /** Primitive interpretations at `offset`. */
  probes: PacketFieldProbe[];
  /** Bytes preserved by the packet as an explicitly opaque payload tail. */
  opaqueBytes?: number;
  error?: unknown;
}

type QueuedOutgoing =
  | { kind: 'packet'; packet: Packet }
  | { kind: 'raw'; id: number; payload: Buffer };

/**
 * An RC4 configuration which is suitable for
 * PacketIO instances being used as a client
 */
export const DEFAULT_RC4: RC4Config = {
  incomingKey: INCOMING_KEY,
  outgoingKey: OUTGOING_KEY,
};

/**
 * An incoming data configuration for when the
 * PacketIO class is used for a proxy
 */
export const PROXY_INCOMING: RC4Config = {
  incomingKey: INCOMING_KEY,
  outgoingKey: INCOMING_KEY
}

/**
 * An outgoing data configuration for when the
 * PacketIO class is used for a proxy
 */
export const PROXY_OUTGOING: RC4Config = {
  incomingKey: OUTGOING_KEY,
  outgoingKey: OUTGOING_KEY
}

/**
 * A utility class which implements the RotMG messaging protocol on top of a `Socket`.
 */
export class PacketIO extends EventEmitter {

  /**
   * The largest packet size (in bytes, including the 5 byte header) which
   * will be accepted. Anything outside `[5, MAX_PACKET_SIZE]` is treated as
   * a corrupt length prefix.
   */
  static readonly MAX_PACKET_SIZE = 0x1000000;
  static readonly DEFAULT_MAX_OUTGOING_QUEUE = 1024;

  /**
   * The socket this packet interface is attached to.
   */
  socket: Socket | undefined;

  /**
   * A packet map object which can be used to resolve incoming and outgoing packet types.
   */
  packetMap: PacketMap;

  /**
   * The last packet which was received
   */
  get lastIncomingPacket(): Packet | undefined {
    return this.lastIncoming;
  }

  /**
   * The last packet which was sent
   */
  get lastOutgoingPacket(): Packet | undefined {
    return this.lastOutgoing;
  }

  private sendRC4: RC4;
  private receiveRC4: RC4;

  private outgoingQueue: QueuedOutgoing[];
  private readonly maxOutgoingQueue: number;
  private drainActive: boolean;
  private writeBlocked: boolean;

  private readonly writer: Writer;
  private readonly reader: Reader;
  private readonly eventHandlers: Map<string, (...args: any[]) => void>;
  private readonly incomingDirection: WirePacketDirection;
  private readonly outgoingDirection: WirePacketDirection;
  private readonly useDirectionalRegistry: boolean;
  private state: PacketIOConnectionState;
  private lastIncoming: Packet | undefined;
  private lastOutgoing: Packet | undefined;

  /**
   * Creates a new `PacketIO` instance
   * @param opts The options to use for this instance
   */
  constructor(opts: PacketIOOptions = { rc4: DEFAULT_RC4 }) {
    super();
    if (!opts.rc4) {
      opts.rc4 = DEFAULT_RC4;
    }
    this.writer = new Writer();
    this.reader = new Reader();
    this.outgoingQueue = [];
    this.maxOutgoingQueue = opts.maxOutgoingQueue ?? PacketIO.DEFAULT_MAX_OUTGOING_QUEUE;
    if (!Number.isInteger(this.maxOutgoingQueue) || this.maxOutgoingQueue < 1) {
      throw new RangeError('maxOutgoingQueue must be a positive integer');
    }
    this.drainActive = false;
    this.writeBlocked = false;
    this.state = 'detached';
    this.sendRC4 = new RC4(opts.rc4.outgoingKey);
    this.receiveRC4 = new RC4(opts.rc4.incomingKey);
    this.packetMap = opts.packetMap || DEFAULT_PACKET_MAP;
    this.incomingDirection = opts.incomingDirection ?? 'incoming';
    this.outgoingDirection = opts.outgoingDirection ?? 'outgoing';
    this.useDirectionalRegistry = this.packetMap === DEFAULT_PACKET_MAP;

    this.eventHandlers = new Map([
      ['data', this.onData.bind(this)],
      ['connect', this.onSocketConnect.bind(this)],
      ['drain', this.onSocketDrain.bind(this)],
      ['close', this.onSocketClose.bind(this)],
      ['error', this.onSocketError.bind(this)],
    ]);

    if (opts.socket) {
      this.attach(opts.socket);
    }
  }

  /**
   * Attaches this Packet IO to the socket
   * @param socket The socket to attach to
   */
  attach(socket: Socket): void {
    if (!(socket instanceof Socket)) {
      throw new TypeError(`Parameter "socket" should be a Socket, not ${typeof socket}`);
    }
    if (this.socket) {
      this.detach();
    }

    this.clearOutgoingQueue();
    this.resetBuffer();
    this.sendRC4.reset();
    this.receiveRC4.reset();
    this.socket = socket;
    this.state = socket.connecting ? 'connecting' : 'connected';
    for (const [event, listener] of this.eventHandlers) {
      this.socket.on(event, listener);
    }
  }

  /**
   * Detaches this Packet IO from its socket
   */
  detach(): void {
    if (this.socket) {
      for (const [event, listener] of this.eventHandlers) {
        this.socket.removeListener(event, listener);
      }
      this.socket = undefined;
    }
    this.clearOutgoingQueue();
    this.state = 'detached';
  }

  /**
   * Emits an `error` event, but only when a listener is attached. Node's
   * EventEmitter throws on an unhandled `'error'` event, which for a library
   * would crash any consumer that hasn't attached a handler — so a single
   * corrupt packet or missing mapping must never do that. Consumers that want
   * to observe these (all recoverable) errors should listen on `'error'`.
   */
  private emitError(error: unknown): void {
    if (this.listenerCount('error') !== 0) {
      this.emit('error', error);
    }
  }

  /**
   * Sends a packet
   * @param packet The packet to send
   */
  send(packet: Packet): SendResult {
    if (!this.canAcceptOutgoing()) {
      return this.sendResult(false, 'disconnected');
    }
    const id = this.packetMap[packet.type];
    if (id === undefined) {
      this.emitError(new RealmlibError('MISSING_MAPPING', `Mapper is missing an id for the packet type ${packet.type}`));
      return this.sendResult(false, 'missing-mapping');
    }
    if (!Number.isInteger(id) || typeof id !== 'number' || id < 0 || id > 255) {
      this.emitError(new RealmlibError(
        'INVALID_PACKET_ID',
        `Mapper id for ${packet.type} must be an integer in [0,255], got ${String(id)}`,
      ));
      return this.sendResult(false, 'invalid');
    }
    return this.enqueueOutgoing({ kind: 'packet', packet });
  }

  /**
   * Sends a raw packet body with an explicit numeric id. This is intended for
   * protocol research around packets that are mapped but not yet modeled.
   * The payload must be the unencrypted body bytes, excluding the 5 byte header.
   */
  sendRaw(id: number, payload: Buffer | number[] = []): SendResult {
    if (!this.canAcceptOutgoing()) {
      return this.sendResult(false, 'disconnected');
    }
    if (!Number.isInteger(id) || id < 0 || id > 255) {
      this.emitError(new RealmlibError('INVALID_RAW_ID', `Raw packet id must be in [0,255], got ${id}`));
      return this.sendResult(false, 'invalid');
    }
    // Buffer.from copies a Buffer and materializes a number[], so one call
    // handles both input shapes (and always gives us an owned copy to cipher).
    const body = Buffer.from(payload as Buffer);
    if (body.length + 5 > PacketIO.MAX_PACKET_SIZE) {
      this.emitError(new RealmlibError('FRAME_TOO_LARGE', `Raw packet size exceeds ${PacketIO.MAX_PACKET_SIZE}`));
      return this.sendResult(false, 'invalid');
    }
    return this.enqueueOutgoing({ kind: 'raw', id, payload: body });
  }

  /** Number of typed/raw packets currently waiting for a socket write. */
  get outgoingQueueSize(): number {
    return this.outgoingQueue.length;
  }

  /** Current socket/queue lifecycle state. */
  get connectionState(): PacketIOConnectionState {
    return this.state;
  }

  private enqueueOutgoing(item: QueuedOutgoing): SendResult {
    if (this.outgoingQueue.length >= this.maxOutgoingQueue) {
      const error = new RealmlibError(
        'OUTGOING_QUEUE_FULL',
        `Outgoing queue limit ${this.maxOutgoingQueue} reached`,
      );
      this.emitError(error);
      this.emit('outgoingDropped', { item, reason: 'queue-full' });
      return this.sendResult(false, 'queue-full');
    }
    const wasActive = this.drainActive || this.state === 'connecting';
    this.outgoingQueue.push(item);
    if (!this.drainActive && this.state === 'connected') {
      this.drainActive = true;
      this.drainQueue();
    }
    return this.sendResult(true, wasActive ? 'queued' : 'sent');
  }

  private sendResult(accepted: boolean, status: SendStatus): SendResult {
    return { accepted, status, queueSize: this.outgoingQueue.length };
  }

  private buildRawFrame(id: number, body: Buffer): Buffer {
    const frame = Buffer.alloc(5 + body.length);
    frame.writeInt32BE(frame.length, 0);
    frame.writeUInt8(id, 4);
    body.copy(frame, 5);
    const type = this.resolvePacketType(id, this.outgoingDirection);
    if (this.listenerCount('sentRawPacket') !== 0) {
      this.emit('sentRawPacket', {
        id,
        type,
        payload: Buffer.from(body),
        size: frame.length,
        direction: 'outgoing',
      } as RawOutgoingPacket);
    }
    this.sendRC4.cipher(frame.subarray(5));
    return frame;
  }

  /**
   * Takes packets from the outgoing queue and writes
   * them to the socket
   */
  private drainQueue(): void {
    if (this.writeBlocked || this.state !== 'connected') {
      return;
    }
    const item = this.outgoingQueue.shift();
    if (!item || !this.socket || this.socket.destroyed) {
      this.drainActive = false;
      return;
    }

    let frame: Buffer;
    try {
      frame = item.kind === 'raw'
        ? this.buildRawFrame(item.id, item.payload)
        : this.buildPacketFrame(item.packet);
    } catch (error) {
      this.emitError(new RealmlibError(
        'PACKET_WRITE_ERROR',
        error instanceof Error ? error.message : String(error),
      ));
      process.nextTick(() => this.drainQueue());
      return;
    }

    try {
      this.writeBlocked = !this.socket.write(frame);
    } catch (error) {
      this.writeBlocked = false;
      this.state = 'connected';
      this.emitError(new RealmlibError(
        'PACKET_WRITE_ERROR',
        error instanceof Error ? error.message : String(error),
      ));
      process.nextTick(() => this.drainQueue());
      return;
    }
    this.state = this.writeBlocked ? 'backpressured' : 'connected';
    if (!this.writeBlocked) {
      process.nextTick(() => this.drainQueue());
    }
  }

  private buildPacketFrame(packet: Packet): Buffer {
    this.lastOutgoing = packet;
    this.writer.index = 5;
    const id = this.packetMap[packet.type] as number;
    packet.write(this.writer);
    this.writer.writeHeader(id);
    if (this.listenerCount('sentPacket') !== 0) {
      this.emit('sentPacket', { id, type: packet.type, size: this.writer.index });
    }
    if (this.listenerCount('sentRawPacket') !== 0) {
      this.emit('sentRawPacket', {
        id,
        type: packet.type,
        payload: Buffer.from(this.writer.buffer.subarray(5, this.writer.index)),
        size: this.writer.index,
        direction: 'outgoing',
      } as RawOutgoingPacket);
    }
    this.sendRC4.cipher(this.writer.buffer.subarray(5, this.writer.index));
    return Buffer.from(this.writer.buffer.subarray(0, this.writer.index));
  }

  private onSocketDrain(): void {
    if (!this.writeBlocked) {
      return;
    }
    this.writeBlocked = false;
    this.state = 'connected';
    this.drainQueue();
  }

  private clearOutgoingQueue(): void {
    if (this.outgoingQueue.length > 0) {
      this.emit('outgoingDropped', {
        count: this.outgoingQueue.length,
        reason: 'connection-reset',
      });
    }
    this.outgoingQueue = [];
    this.drainActive = false;
    this.writeBlocked = false;
  }

  /**
   * Emits a packet from this PacketIO instance. This will only
   * emit the packet to the clients subscribed to this particular PacketIO.
   * @param packet The packet to emit.
   */
  emitPacket(packet: Packet): void {
    if (packet && typeof packet.type === 'string') {
      this.lastIncoming = packet;
      this.emit(packet.type, packet);
    } else {
      throw new TypeError(`Parameter "packet" must be a Packet, not ${typeof packet}`);
    }
  }

  private onSocketConnect(): void {
    this.resetBuffer();
    this.sendRC4.reset();
    this.receiveRC4.reset();
    this.state = 'connected';
    if (this.outgoingQueue.length !== 0 && !this.drainActive) {
      this.drainActive = true;
      this.drainQueue();
    }
  }

  private onSocketClose(): void {
    this.state = 'closed';
    this.clearOutgoingQueue();
    this.resetBuffer();
  }

  private onSocketError(error: unknown): void {
    this.emitError(error);
  }

  private canAcceptOutgoing(): boolean {
    return this.socket !== undefined
      && !this.socket.destroyed
      && this.state !== 'detached'
      && this.state !== 'closed';
  }

  /**
   * Adds the data received from the socket to the reader buffer
   * @param data The data received
   */
  private onData(data: Buffer): void {
    let dataIdx = 0;
    while (dataIdx < data.length) {
      const copied = data.copy(this.reader.buffer, this.reader.index, dataIdx, dataIdx + this.reader.remaining);
      dataIdx += copied;
      this.reader.index += copied;
      if (this.reader.remaining === 0) {
        if (this.reader.length === 4) {
          const newSize = this.reader.buffer.readInt32BE(0);
          if (newSize < 5 || newSize > PacketIO.MAX_PACKET_SIZE) {
            this.emitError(new RealmlibError('FRAME_TOO_LARGE', `Invalid packet size: ${newSize}`));
            this.socket?.destroy();
            return;
          }
          this.reader.resizeBuffer(newSize);
        } else {
          const packet = this.constructPacket();
          this.resetBuffer();
          if (packet) {
            // A throwing packet listener must not abort the read loop: doing
            // so would drop every later packet buffered in this chunk along
            // with their required ACKs (server replies with IgnoredAck / 21).
            try {
              this.emitPacket(packet);
            } catch (err) {
              this.emitError(err);
            }
          }
        }
      }
    }
  }

  /**
   * Attempts to create a packet from the data contained
   * in the reader buffer. No packet will be created if
   * there is no event listener for the packet type
   */
  private constructPacket(): Packet | undefined {
    this.receiveRC4.cipher(this.reader.buffer.subarray(5, this.reader.length));
    try {
      const id = this.reader.buffer.readUInt8(4);
      const type = this.resolvePacketType(id, this.incomingDirection);
      this.reader.index = 5;

      // Debug hook: surface the raw bytes of every incoming packet (mapped
      // or not) so consumers can log/inspect them. Only built when observed.
      const payload = Buffer.from(this.reader.buffer.subarray(5, this.reader.length));
      if (this.listenerCount('rawPacket') !== 0) {
        const rawPacket: RawPacket = {
          id,
          type,
          payload,
          size: this.reader.length,
          direction: 'incoming',
        };
        this.emit('rawPacket', rawPacket);
      }

      if (!type) {
        const diagnostic = this.createDiagnostic(id, type, payload, 'unknown', 0);
        this.emit('unknownPacket', diagnostic);
        this.emit('packetDiagnostic', diagnostic);
        return undefined;
      }
      const shouldParse = this.listenerCount(type) !== 0
        || this.listenerCount('packetDiagnostic') !== 0
        || this.listenerCount('packetParseError') !== 0
        || this.listenerCount('packetLeftover') !== 0
        || this.listenerCount('packetOpaque') !== 0;
      if (shouldParse) {
        let packet: Packet;
        try {
          packet = createPacket(type);
        } catch (error) {
          const diagnostic = this.createDiagnostic(id, type, payload, 'unimplemented', 0, error);
          this.emit('packetDiagnostic', diagnostic);
          return undefined;
        }
        try {
          packet.read(this.reader);
        } catch (error) {
          const offset = Math.max(0, this.reader.index - 5);
          const diagnostic = this.createDiagnostic(id, type, payload, 'parse-error', offset, error);
          this.emit('packetParseError', diagnostic);
          this.emit('packetDiagnostic', diagnostic);
          this.emitError(error);
          return undefined;
        }
        if (this.reader.remaining !== 0) {
          const offset = Math.max(0, this.reader.index - 5);
          const diagnostic = this.createDiagnostic(id, type, payload, 'leftover', offset);
          this.emit('packetLeftover', diagnostic);
          this.emit('packetDiagnostic', diagnostic);
          return packet;
        }
        const opaqueTail = (packet as Packet & { opaqueTail?: unknown }).opaqueTail;
        if (Buffer.isBuffer(opaqueTail) && opaqueTail.length !== 0) {
          const offset = Math.max(0, this.reader.index - 5);
          const diagnostic = this.createDiagnostic(id, type, payload, 'opaque', offset);
          diagnostic.opaqueBytes = opaqueTail.length;
          this.emit('packetOpaque', diagnostic);
          this.emit('packetDiagnostic', diagnostic);
          return packet;
        }
        if (this.listenerCount('packetDiagnostic') !== 0) {
          const offset = Math.max(0, this.reader.index - 5);
          this.emit('packetDiagnostic', this.createDiagnostic(id, type, payload, 'parsed', offset));
        }
        return packet;
      }
    } catch (error) {
      this.emitError(error);
    }
  }

  private createDiagnostic(
    id: number,
    type: PacketType | undefined,
    payload: Buffer,
    status: PacketDiagnostic['status'],
    offset: number,
    error?: unknown,
  ): PacketDiagnostic {
    const safeOffset = Math.min(Math.max(0, offset), payload.length);
    return {
      id,
      type,
      payload: Buffer.from(payload),
      size: payload.length + 5,
      direction: 'incoming',
      status,
      offset: safeOffset,
      remaining: payload.length - safeOffset,
      probes: probePacketFields(payload, safeOffset),
      error,
    };
  }

  private resolvePacketType(
    id: number,
    direction: WirePacketDirection,
  ): PacketType | undefined {
    if (this.useDirectionalRegistry) {
      return getPacketDefinitionById(id, direction)?.type;
    }
    const mapped = this.packetMap[id];
    return typeof mapped === 'string' ? mapped as PacketType : undefined;
  }

  /**
   * Resets the incoming packet buffer so that it
   * is ready to receive the next packet header
   */
  private resetBuffer(): void {
    this.reader.resizeBuffer(4);
    this.reader.index = 0;
  }
}
