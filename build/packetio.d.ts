/// <reference types="node" />
import { EventEmitter } from 'events';
import { Socket } from 'net';
import { Packet } from './packet';
import { PacketMap } from './packet-map';
/**
 * The configuration for the RC4 ciphers used by this PacketIO
 */
export interface RC4Config {
    incomingKey: string;
    outgoingKey: string;
}
/**
 * An RC4 configuration which is suitable for
 * PacketIO instances being used as a client
 */
export declare const DEFAULT_RC4: RC4Config;
/**
 * An incoming data configuration for when the
 * PacketIO class is used for a proxy
 */
export declare const PROXY_INCOMING: RC4Config;
/**
 * An outgoing data configuration for when the
 * PacketIO class is used for a proxy
 */
export declare const PROXY_OUTGOING: RC4Config;
/**
 * A utility class which implements the RotMG messaging protocol on top of a `Socket`.
 */
export declare class PacketIO extends EventEmitter {
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
    get lastIncomingPacket(): Packet | undefined;
    /**
     * The last packet which was sent
     */
    get lastOutgoingPacket(): Packet | undefined;
    private sendRC4;
    private receiveRC4;
    private outgoingQueue;
    private readonly writer;
    private readonly reader;
    private readonly eventHandlers;
    private lastIncoming;
    private lastOutgoing;
    /**
     * Creates a new `PacketIO` instance
     * @param opts The options to use for this instance
     */
    constructor(opts?: {
        socket?: Socket;
        rc4?: RC4Config;
        packetMap?: PacketMap;
    });
    /**
     * Attaches this Packet IO to the socket
     * @param socket The socket to attach to
     */
    attach(socket: Socket): void;
    /**
     * Detaches this Packet IO from its socket
     */
    detach(): void;
    /**
     * Sends a packet
     * @param packet The packet to send
     */
    send(packet: Packet): void;
    /**
     * Takes packets from the outgoing queue and writes
     * them to the socket
     */
    private drainQueue;
    /**
     * Emits a packet from this PacketIO instance. This will only
     * emit the packet to the clients subscribed to this particular PacketIO.
     * @param packet The packet to emit.
     */
    emitPacket(packet: Packet): void;
    /**
     * Resets the reader buffer and the RC4 instances
     */
    private resetState;
    /**
     * Adds the data received from the socket to the reader buffer
     * @param data The data received
     */
    private onData;
    /**
     * Attempts to create a packet from the data contained
     * in the reader buffer. No packet will be created if
     * there is no event listener for the packet type
     */
    private constructPacket;
    /**
     * Resets the incoming packet buffer so that it
     * is ready to receive the next packet header
     */
    private resetBuffer;
}
