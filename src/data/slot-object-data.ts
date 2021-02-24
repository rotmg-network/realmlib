import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';

export class SlotObjectData implements DataPacket {

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

  constructor() {
    this.objectId = 0;
    this.slotId = 0;
    this.objectType = 0;
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
    this.slotId = reader.readInt32();
    this.objectType = reader.readUInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectId);
    writer.writeInt32(this.slotId);
    writer.writeInt32(this.objectType);
  }

  toString(): string {
    return `[SlotObjectData] ObjectId: ${this.objectId} - SlotId: ${this.slotId} - ObjectType: ${this.objectType}`;
  }
}
