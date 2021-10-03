import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent when the player inflicts a condition effect.
 */
export declare class SetConditionPacket implements Packet {
    readonly type = PacketType.SETCONDITION;
    /**
     * The condition effect being conflicted.
     */
    conditionEffect: number;
    /**
     * The duration of the conditin effect.
     */
    conditionDuration: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
