import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to recycle a skin. Layout from the 6.12.0.2.0 client binary (class
 * `CHOPGKLANLE`, vtable id 146): a single `SlotObjectData` naming where the
 * skin item sits. The server answers with `SKIN_RECYCLE_RESPONSE` (147).
 * No wire capture exists yet.
 */
export class SkinRecyclePacket implements Packet {

  readonly type = PacketType.SKIN_RECYCLE;

  //#region packet-specific members
  /** Where the skin sits: owner objectId, slot index, skin item type. */
  slotObject: SlotObjectData;
  //#endregion

  constructor() {
    this.slotObject = new SlotObjectData();
  }

  read(reader: Reader): void {
    this.slotObject = new SlotObjectData();
    this.slotObject.read(reader);
  }

  write(writer: Writer): void {
    this.slotObject.write(writer);
  }
}
