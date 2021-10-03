import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
export declare class ForgeRequestPacket implements Packet {
    readonly type = PacketType.FORGE_REQUEST;
    /**
     * The object id of the item to forge.
     */
    objectId: number;
    /**
     * The items to dismantle.
     */
    slotsUsed: SlotObjectData;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
