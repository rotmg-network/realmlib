import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to notify the player that a new skin has been unlocked
 */
export declare class ReskinUnlockPacket implements Packet {
    readonly type = PacketType.RESKIN_UNLOCK;
    /**
     * The id of the skin that was unlocked
     */
    skinId: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
