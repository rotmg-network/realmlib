import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Sent to enter the arena.
 */
export declare class EnterArenaPacket implements Packet {
    readonly type = PacketType.ENTER_ARENA;
    propagate: boolean;
    /**
     * > Unknown.
     */
    currency: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
