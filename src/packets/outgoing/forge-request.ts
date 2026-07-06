import { SlotObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';


export class ForgeRequestPacket implements Packet {

  readonly type = PacketType.FORGE_REQUEST;

  /**
   * The item type produced by the forge (RealmShark: `resultItemType`).
   */
  resultItemType: number;
  /**
   * The items dismantled to forge it (RealmShark: `dismantledItems`).
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
