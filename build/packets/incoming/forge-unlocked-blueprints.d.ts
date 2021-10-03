import { Reader } from "../../reader";
import { Writer } from "../../writer";
import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
/**
 * Received when the player enters the nexus
 */
export declare class ForgeUnlockedBlueprints implements Packet {
    readonly type = PacketType.FORGE_UNLOCKED_BLUEPRINTS;
    /**
     * The itemIds of unlocked blueprints in an array
     */
    unlockedBlueprints: number[];
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
