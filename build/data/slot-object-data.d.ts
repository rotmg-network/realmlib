import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
export declare class SlotObjectData implements DataPacket {
    /**
     * The object id of the entity which owns the slot
     */
    objectId: number;
    /**
     * The index of the slot - e.g. the 4th inventory slot has the slot id 3
     */
    slotId: number;
    /**
     * The item id of the item in the slot, or -1 if it is empty
     */
    objectType: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
