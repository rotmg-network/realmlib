import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { Writer } from "../../writer";
/**
 * Received when the players exaltation stats update
 */
export declare class ExaltationUpdatePacket implements Packet {
    readonly type = PacketType.EXALTATION_BONUS_CHANGED;
    /**
     * The object type of the player's class
     */
    objType: number;
    /**
     * The amount of stats to increase
     */
    attackProgress: number;
    defenseProgress: number;
    speedProgress: number;
    dexterityProgress: number;
    vitalityProgress: number;
    wisdomProgress: number;
    healthProgress: number;
    manaProgress: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
