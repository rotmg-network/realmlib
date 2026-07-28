import { EventEmitter } from 'events';
import { Socket } from 'net';
import { Packet } from '../packet';
import { DEFAULT_PACKET_MAP, ReadonlyPacketMap } from '../packet-map';
import { PacketType } from '../packet-type';
import { Reader } from '../reader';
import { Writer } from '../writer';
import { createPacket } from '../create-packet';
import { INCOMING_KEY, OUTGOING_KEY, RC4 } from '../crypto/rc4';
import {
  PacketMappingError,
  PacketWriteError,
  RealmlibError,
  UnknownPacketTypeError,
} from '../errors';
import { probePacketFields } from '../debug';
import { FrameDecoder } from './frame-decoder';
import { encodePacketFrame, encodeRawFrame, encryptFrameBody } from './frame-encoder';
import { OutgoingQueue } from './outgoing-queue';
import { PacketResolver } from './packet-resolver';
import {
  PacketDiagnostic,
  PacketIOEventMap,
  QueuedOutgoing,
  RawOutgoingPacket,
  RawPacket,
  WirePacketDirection,
} from './packetio-events';

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
  packetMap?: ReadonlyPacketMap;
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
export class PacketIO extends EventEmitter<PacketIOEventMap> {

  /**
   * The largest packet size (in bytes, including the 5 byte header) which
   * will be accepted. Anything outside `[5, MAX_PACKET_SIZE]` is treated as
   * a corrupt length prefix.
   */
  static readonly MAX_PACKET_SIZE = 0x1000000;
  static readonly DEFAULT_MAX_OUTGOING_QUEUE = 1024;

  /**
   * Registers a listener for a concrete packet type without widening its
   * parameter to the base {@link Packet} interface.
   */
  override on<
    TType extends PacketType,
    TPacket extends Packet,
  >(eventName: TType, listener: (packet: TPacket) => void): this;
  override on<TEvent extends keyof PacketIOEventMap>(
    eventName: TEvent,
    listener: (...args: PacketIOEventMap[TEvent]) => void,
  ): this;
  override on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    const addListener = EventEmitter.prototype.on as unknown as (
      event: string | symbol,
      callback: (...args: any[]) => void,
    ) => EventEmitter;
    addListener.call(this, eventName, listener);
    return this;
  }

  /**
   * Registers a one-shot listener with the same concrete-packet inference as
   * {@link PacketIO.on}.
   */
  override once<
    TType extends PacketType,
    TPacket extends Packet,
  >(eventName: TType, listener: (packet: TPacket) => void): this;
  override once<TEvent extends keyof PacketIOEventMap>(
    eventName: TEvent,
    listener: (...args: PacketIOEventMap[TEvent]) => void,
  ): this;
  override once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    const addOnceListener = EventEmitter.prototype.once as unknown as (
      event: string | symbol,
      callback: (...args: any[]) => void,
    ) => EventEmitter;
    addOnceListener.call(this, eventName, listener);
    return this;
  }

  /**
   * The socket this packet interface is attached to.
   */
  socket: Socket | undefined;

  /**
   * A packet map object which can be used to resolve incoming and outgoing packet types.
   */
  get packetMap(): ReadonlyPacketMap {
    return this.currentPacketMap;
  }

  set packetMap(value: ReadonlyPacketMap) {
    this.currentPacketMap = value;
    this.resolver = new PacketResolver(value, DEFAULT_PACKET_MAP);
  }

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

  private readonly outgoingQueue: OutgoingQueue<QueuedOutgoing>;
  private drainActive: boolean;
  private writeBlocked: boolean;

  private readonly writer: Writer;
  private readonly reader: Reader;
  private readonly frameDecoder: FrameDecoder;
  private resolver: PacketResolver;
  private currentPacketMap: ReadonlyPacketMap;
  private readonly incomingDirection: WirePacketDirection;
  private readonly outgoingDirection: WirePacketDirection;
  private readonly dataHandler: (data: Buffer) => void;
  private readonly connectHandler: () => void;
  private readonly drainHandler: () => void;
  private readonly closeHandler: () => void;
  private readonly socketErrorHandler: (error: Error) => void;
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
    const maximumQueueSize = opts.maxOutgoingQueue ?? PacketIO.DEFAULT_MAX_OUTGOING_QUEUE;
    if (!Number.isInteger(maximumQueueSize) || maximumQueueSize < 1) {
      throw new RangeError('maxOutgoingQueue must be a positive integer');
    }
    this.outgoingQueue = new OutgoingQueue(maximumQueueSize);
    this.frameDecoder = new FrameDecoder(PacketIO.MAX_PACKET_SIZE);
    this.drainActive = false;
    this.writeBlocked = false;
    this.state = 'detached';
    this.sendRC4 = new RC4(opts.rc4.outgoingKey);
    this.receiveRC4 = new RC4(opts.rc4.incomingKey);
    this.currentPacketMap = opts.packetMap || DEFAULT_PACKET_MAP;
    this.resolver = new PacketResolver(this.currentPacketMap, DEFAULT_PACKET_MAP);
    this.incomingDirection = opts.incomingDirection ?? 'incoming';
    this.outgoingDirection = opts.outgoingDirection ?? 'outgoing';
    this.dataHandler = this.onData.bind(this);
    this.connectHandler = this.onSocketConnect.bind(this);
    this.drainHandler = this.onSocketDrain.bind(this);
    this.closeHandler = this.onSocketClose.bind(this);
    this.socketErrorHandler = this.onSocketError.bind(this);

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
    this.socket.on('data', this.dataHandler);
    this.socket.on('connect', this.connectHandler);
    this.socket.on('drain', this.drainHandler);
    this.socket.on('close', this.closeHandler);
    this.socket.on('error', this.socketErrorHandler);
  }

  /**
   * Detaches this Packet IO from its socket
   */
  detach(): void {
    if (this.socket) {
      this.socket.removeListener('data', this.dataHandler);
      this.socket.removeListener('connect', this.connectHandler);
      this.socket.removeListener('drain', this.drainHandler);
      this.socket.removeListener('close', this.closeHandler);
      this.socket.removeListener('error', this.socketErrorHandler);
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
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
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
    const id = this.resolver.idFor(packet.type);
    if (id === undefined) {
      this.emitError(new PacketMappingError(
        'MISSING_MAPPING',
        `Mapper is missing an id for the packet type ${packet.type}`,
      ));
      return this.sendResult(false, 'missing-mapping');
    }
    if (!Number.isInteger(id) || id < 0 || id > 255) {
      this.emitError(new PacketMappingError(
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
      this.emitError(new PacketMappingError(
        'INVALID_RAW_ID',
        `Raw packet id must be in [0,255], got ${id}`,
      ));
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
    return this.outgoingQueue.size;
  }

  /** Current socket/queue lifecycle state. */
  get connectionState(): PacketIOConnectionState {
    return this.state;
  }

  private enqueueOutgoing(item: QueuedOutgoing): SendResult {
    if (this.outgoingQueue.full) {
      const error = new RealmlibError(
        'OUTGOING_QUEUE_FULL',
        `Outgoing queue limit ${this.outgoingQueue.maximumSize} reached`,
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
    return { accepted, status, queueSize: this.outgoingQueue.size };
  }

  private buildRawFrame(id: number, body: Buffer): Buffer {
    const frame = encodeRawFrame(id, body);
    const type = this.resolver.typeFor(id, this.outgoingDirection);
    if (this.listenerCount('sentRawPacket') !== 0) {
      this.emit('sentRawPacket', {
        id,
        type,
        payload: Buffer.from(body),
        size: frame.length,
        direction: 'outgoing',
      } as RawOutgoingPacket);
    }
    return encryptFrameBody(frame, this.sendRC4);
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
      this.emitError(new PacketWriteError(error instanceof Error ? error.message : String(error)));
      process.nextTick(() => this.drainQueue());
      return;
    }

    try {
      this.writeBlocked = !this.socket.write(frame);
    } catch (error) {
      this.writeBlocked = false;
      this.state = 'connected';
      this.emitError(new PacketWriteError(error instanceof Error ? error.message : String(error)));
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
    const id = this.resolver.idFor(packet.type) as number;
    const frame = encodePacketFrame(packet, id, this.writer);
    if (this.listenerCount('sentPacket') !== 0) {
      this.emit('sentPacket', { id, type: packet.type, size: frame.length });
    }
    if (this.listenerCount('sentRawPacket') !== 0) {
      this.emit('sentRawPacket', {
        id,
        type: packet.type,
        payload: Buffer.from(frame.subarray(5)),
        size: frame.length,
        direction: 'outgoing',
      } as RawOutgoingPacket);
    }
    return encryptFrameBody(frame, this.sendRC4);
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
    const count = this.outgoingQueue.clear();
    if (count > 0) {
      this.emit('outgoingDropped', {
        count,
        reason: 'connection-reset',
      });
    }
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
    if (this.outgoingQueue.size !== 0 && !this.drainActive) {
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
    let frames: Buffer[];
    try {
      frames = this.frameDecoder.push(data);
    } catch (error) {
      this.emitError(error);
      this.socket?.destroy();
      return;
    }
    for (const frame of frames) {
      const packet = this.constructPacket(frame);
      if (packet) {
        // A throwing packet listener must not abort the read loop: doing so
        // would drop later packets buffered in this chunk and their ACKs.
        try {
          this.emitPacket(packet);
        } catch (error) {
          this.emitError(error);
        }
      }
    }
  }

  /**
   * Attempts to create a packet from the data contained
   * in the reader buffer. No packet will be created if
   * there is no event listener for the packet type
   */
  private constructPacket(frame: Buffer): Packet | undefined {
    this.receiveRC4.cipher(frame.subarray(5));
    try {
      const id = frame.readUInt8(4);
      const type = this.resolver.typeFor(id, this.incomingDirection);
      const payload = frame.subarray(5);

      if (this.listenerCount('rawPacket') !== 0) {
        const rawPacket: RawPacket = {
          id,
          type,
          payload: Buffer.from(payload),
          size: this.reader.length,
          direction: 'incoming',
        };
        this.emit('rawPacket', rawPacket);
      }

      if (!type) {
        if (this.listenerCount('unknownPacket') !== 0
          || this.listenerCount('packetDiagnostic') !== 0) {
          const diagnostic = this.createDiagnostic(
            id,
            type,
            payload,
            'unknown',
            0,
            new UnknownPacketTypeError(id),
          );
          this.emit('unknownPacket', diagnostic);
          this.emit('packetDiagnostic', diagnostic);
        }
        return undefined;
      }
      const shouldParse = this.listenerCount(type) !== 0
        || this.listenerCount('packetDiagnostic') !== 0
        || this.listenerCount('packetParseError') !== 0
        || this.listenerCount('packetLeftover') !== 0
        || this.listenerCount('packetOpaque') !== 0;
      if (shouldParse) {
        this.reader.resizeBuffer(frame.length);
        frame.copy(this.reader.buffer);
        this.reader.index = 5;
        let packet: Packet;
        try {
          packet = createPacket(type);
        } catch (error) {
          if (this.listenerCount('packetDiagnostic') !== 0) {
            const diagnostic = this.createDiagnostic(id, type, payload, 'unimplemented', 0, error);
            this.emit('packetDiagnostic', diagnostic);
          }
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

  /**
   * Resets the incoming packet buffer so that it
   * is ready to receive the next packet header
   */
  private resetBuffer(): void {
    this.frameDecoder.reset();
    this.reader.resizeBuffer(Reader.DEFAULT_SIZE);
    this.reader.index = 0;
  }
}
