import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to instruct the client to connect to a new host
 */
export declare class ReconnectPacket implements Packet {
    readonly type = PacketType.RECONNECT;
    /**
     * The name of the new host.
     */
    name: string;
    /**
     * The address of the new host
     */
    host: string;
    /**
     * The port of the new host
     */
    port: number;
    /**
     * The `gameId` to send in the next `HelloPacket`
     */
    gameId: number;
    /**
     * The `keyTime` to send in the next `HelloPacket`
     */
    keyTime: number;
    /**
     * The `key` to send in the next `HelloPacket`
     */
    key: number[];
    /**
     * Whether or not the new host is from the arena
     */
    isFromArena: boolean;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
