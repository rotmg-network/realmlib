import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { Writer } from "../../writer";
import { SlotObjectData } from '../../data';
/**
* Received when the player uses the item forge
*/
export declare class ForgeResultPacket implements Packet {
    readonly type = PacketType.FORGE_RESULT;
    /**
     * Whether the forge was successful
     */
    success: boolean;
    /**
     * The SlotObjectData of the items forged
     */
    results: SlotObjectData[];
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
