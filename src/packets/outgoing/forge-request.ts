import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';


/**
 * Sent to forge an item, dismantling other items to pay for it. The server
 * replies with a `ForgeResultPacket` (success byte), then toggles
 * `FORGE_UNLOCKED_BLUEPRINTS` and refreshes `VAULT_CONTENT`.
 *
 * Confirmed from a capture: `resultItemType` int32 then an int32 count then
 * that many `SlotObjectData`. Body `00002289 00000002 <slot> <slot>` forged
 * item 8841 by dismantling items 1155 and 1156 out of the forge container
 * (objectId 599, slots 8 and 4).
 */
export class ForgeRequestPacket implements Packet {

  readonly type = PacketType.FORGE_REQUEST;

  /**
   * The item type produced by the forge (RealmShark: `resultItemType`).
   */
  resultItemType: number;
  /**
   * The items dismantled to pay for the forge (RealmShark: `dismantledItems`).
   * Each references the forge container slot and the item id consumed.
   */
  dismantledItems: SlotObjectData[];

  constructor() {
    this.resultItemType = 0;
    this.dismantledItems = [];
  }

  write(writer: Writer): void {
    writer.writeInt32(this.resultItemType);
    writer.writeInt32(this.dismantledItems.length);
    for (const slot of this.dismantledItems) {
      slot.write(writer);
    }
  }

  read(reader: Reader): void {
    this.resultItemType = reader.readInt32();
    const count = reader.readInt32();
    this.dismantledItems = new Array<SlotObjectData>(count);
    for (let i = 0; i < count; i++) {
      const slot = new SlotObjectData();
      slot.read(reader);
      this.dismantledItems[i] = slot;
    }
  }
}
