import { SlotObjectData } from '../../data/slot-object-data';
import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to swap the items of two slots.
 */
export declare class InvSwapPacket implements Packet {
    readonly type = PacketType.INVSWAP;
    /**
     * The current client time.
     */
    time: number;
    /**
     * The current client position.
     */
    position: WorldPosData;
    /**
     * The slot to swap from.
     */
    slotObject1: SlotObjectData;
    /**
     * The slot to swap to.
     */
    slotObject2: SlotObjectData;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
