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

  /**
   * Creates a slot reference, e.g. for building an `InvSwapPacket`.
   * @param objectId The id of the entity which owns the slot.
   * @param slotId The index of the slot.
   * @param objectType The item id in the slot, or -1 if it is empty.
   */
  static from(objectId: number, slotId: number, objectType: number): SlotObjectData {
    const slot = new SlotObjectData();
    slot.objectId = objectId;
    slot.slotId = slotId;
    slot.objectType = objectType;
    return slot;
  }

  /**
   * Whether this slot exists but holds no item (`objectType === -1`).
   */
  isEmpty(): boolean {
    return this.objectType === -1;
  }

  /**
   * Whether this is the null slot (`objectId 0, objectType 0`). Used by the
   * server in `INVRESULT` pushes as the `toSlot` to mean "the item in
   * `fromSlot` was removed entirely".
   */
  isNull(): boolean {
    return this.objectId === 0 && this.objectType === 0;
  }

  /**
   * Whether this slot refers to the same owner/slot/item as `other`.
   */
  equals(other: SlotObjectData): boolean {
    return this.objectId === other.objectId
      && this.slotId === other.slotId
      && this.objectType === other.objectType;
  }

  clone(): SlotObjectData {
    return SlotObjectData.from(this.objectId, this.slotId, this.objectType);
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
    this.slotId = reader.readInt32();
    // Signed: an empty slot is -1 on the wire. Reading it unsigned (4294967295)
    // then writing it back with writeInt32 (below) throws "out of range", so an
    // empty slot could not round-trip. Item ids are positive, so signed is safe.
    this.objectType = reader.readInt32();
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
