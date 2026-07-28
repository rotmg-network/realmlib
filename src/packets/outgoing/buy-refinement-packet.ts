import { SlotObjectData } from '../../data/slot-object-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Actions accepted by the current client's refinement request. */
export enum RefinementAction {
  Upgrade = 1,
  Downgrade = 2,
  Reroll = 3,
  Wipe = 4,
}

/**
 * Requests a dungeon-modifier refinement (packet 136).
 *
 * Native serializer evidence shows a SlotObjectData, an int16 action, then a
 * byte count followed by byte-sized modifier indexes. The managed collection
 * is `IList<int32>`, but its values are narrowed to bytes on the wire.
 */
export class BuyRefinementPacket implements Packet {
  readonly type = PacketType.BUY_REFINEMENT;

  slotObject: SlotObjectData;
  action: RefinementAction;
  modifierIndices: number[];

  constructor() {
    this.slotObject = new SlotObjectData();
    this.action = RefinementAction.Upgrade;
    this.modifierIndices = [];
  }

  read(reader: Reader): void {
    this.slotObject = new SlotObjectData();
    this.slotObject.read(reader);
    this.action = reader.readShort() as RefinementAction;
    const count = reader.validateCollectionCount(
      reader.readUnsignedByte(),
      1,
      'refinement modifier',
    );
    this.modifierIndices = new Array<number>(count);
    for (let i = 0; i < count; i++) {
      this.modifierIndices[i] = reader.readUnsignedByte();
    }
  }

  write(writer: Writer): void {
    this.slotObject.write(writer);
    writer.writeShort(this.action);
    writer.writeUnsignedByte(this.modifierIndices.length);
    for (const modifierIndex of this.modifierIndices) {
      writer.writeUnsignedByte(modifierIndex);
    }
  }
}
