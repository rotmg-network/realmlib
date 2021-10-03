import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Received when the player has been killed in the arena.
 */
export declare class ArenaDeathPacket implements Packet {
    readonly type = PacketType.ARENA_DEATH;
    propagate: boolean;
    /**
     * The cost in gold to be revived.
     */
    cost: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
