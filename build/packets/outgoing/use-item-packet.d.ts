import { SlotObjectData } from '../../data/slot-object-data';
import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to use an item, such as an ability or consumable.
 */
export declare class UseItemPacket implements Packet {
    readonly type = PacketType.USEITEM;
    /**
     * The current client time.
     */
    time: number;
    /**
     * The slot of the item being used.
     */
    slotObject: SlotObjectData;
    /**
     * The position at which the item was used.
     */
    itemUsePos: WorldPosData;
    /**
     * The type of item usage.
     */
    useType: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
