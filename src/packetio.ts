import { EventEmitter } from 'events';
import { Socket } from 'net';
import { Packet } from './packet';
import { DEFAULT_PACKET_MAP, PacketMap } from './packet-map';
import { PacketType } from './packet-type';
import { Reader } from './reader';
import { Writer } from './writer';
import { createPacket } from './create-packet';
import { INCOMING_KEY, OUTGOING_KEY, RC4 } from './crypto/rc4';

/**
 * The configuration for the RC4 ciphers used by this PacketIO
 */
export interface RC4Config {
  incomingKey: string;
  outgoingKey: string;
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
export class PacketIO extends EventEmitter {

  /**
   * The largest packet size (in bytes, including the 5 byte header) which
   * will be accepted. Anything outside `[5, MAX_PACKET_SIZE]` is treated as
   * a corrupt length prefix.
   */
  static readonly MAX_PACKET_SIZE = 0x1000000;

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

  private outgoingQueue: Packet[];

  private readonly writer: Writer;
  private readonly reader: Reader;
  private readonly eventHandlers: Map<string, (...args: any[]) => void>;
  private lastIncoming: Packet | undefined;
  private lastOutgoing: Packet | undefined;

  /**
   * Creates a new `PacketIO` instance
   * @param opts The options to use for this instance
   */
  constructor(opts: { socket?: Socket, rc4?: RC4Config, packetMap?: PacketMap } = { rc4: DEFAULT_RC4 }) {
    super();
    if (!opts.rc4) {
      opts.rc4 = DEFAULT_RC4;
    }
    this.writer = new Writer();
    this.reader = new Reader();
    this.outgoingQueue = [];
    this.sendRC4 = new RC4(opts.rc4.outgoingKey);
    this.receiveRC4 = new RC4(opts.rc4.incomingKey);
    this.packetMap = opts.packetMap || DEFAULT_PACKET_MAP;

    this.eventHandlers = new Map([
      ['data', this.onData.bind(this)],
      ['connect', this.resetState.bind(this)]
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

    this.resetState();
    this.socket = socket;
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
  }

  /**
   * Sends a packet
   * @param packet The packet to send
   */
  send(packet: Packet) {
    if (!this.socket || this.socket.destroyed) {
      //this.emit('error', new Error('Not attached to a socket.'));
      return;
    }
    const type = this.packetMap[packet.type];
    if (type === undefined) {
      this.emit('error', new Error(`Mapper is missing an id for the packet type ${packet.type}`));
      return;
    }

    if (this.outgoingQueue.length === 0) {
      this.outgoingQueue.push(packet);
      this.drainQueue();
    } else {
      this.outgoingQueue.push(packet);
    }
  }

  /**
   * Takes packets from the outgoing queue and writes
   * them to the socket
   */
  private drainQueue(): void {
    const packet = this.outgoingQueue.shift()!;
    this.lastOutgoing = packet;
    this.writer.index = 5;
    const type = this.packetMap[packet?.type];
    packet.write(this.writer);
    this.writer.writeHeader(type);
    if (this.listenerCount('sentPacket') !== 0) {
      this.emit('sentPacket', { id: type, type: packet.type, size: this.writer.index });
    }
    this.sendRC4.cipher(this.writer.buffer.subarray(5, this.writer.index));
    if (this.socket && !this.socket.write(this.writer.buffer.subarray(0, this.writer.index))) {
      this.socket.once('drain', () => {
        if (this.outgoingQueue.length > 0) {
          this.drainQueue();
        }
      });
    } else {
      process.nextTick(() => {
        if (this.outgoingQueue.length > 0) {
          this.drainQueue();
        }
      });
    }
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

  /**
   * Resets the reader buffer and the RC4 instances
   */
  private resetState(): void {
    this.resetBuffer();
    this.sendRC4.reset();
    this.receiveRC4.reset();
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
            this.emit('error', new Error(`Invalid packet size: ${newSize}`));
            this.socket?.destroy();
            return;
          }
          this.reader.resizeBuffer(newSize);
        } else {
          const packet = this.constructPacket();
          this.resetBuffer();
          if (packet) {
            this.emitPacket(packet);
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
      const id = this.reader.buffer.readInt8(4);
      const type = this.packetMap[id];
      this.reader.index = 5;

      // Debug hook: surface the raw bytes of every incoming packet (mapped
      // or not) so consumers can log/inspect them. Only built when observed.
      if (this.listenerCount('rawPacket') !== 0) {
        const rawPacket: RawPacket = {
          id,
          type,
          payload: Buffer.from(this.reader.buffer.subarray(5, this.reader.length)),
        };
        this.emit('rawPacket', rawPacket);
      }

      if (!type) {
        this.emit('unknownPacket', { id, size: this.reader.length });
        return undefined;
      }
      if (this.listenerCount(type) !== 0) {
        const packet = createPacket(type);
        packet.read(this.reader);
        return packet;
      }
    } catch (error) {
      this.emit('error', error);
    }
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
