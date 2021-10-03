import { SlotObjectData } from '../../data/slot-object-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to drop an item from the client's inventory.
 */
export declare class InvDropPacket implements Packet {
    readonly type = PacketType.INVDROP;
    /**
     * The slot to drop the item from.
     */
    slotObject: SlotObjectData;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
