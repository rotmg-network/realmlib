import { SlotObjectData } from '../../../data/slot-object-data';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';

/**
 * > Unknown.
 */
export class QuestRedeemPacket implements Packet {

  readonly type = PacketType.QUEST_REDEEM;
  propagate = true;

  //#region packet-specific members
  /**
   * > Unknown.
   */
  questId: string;
  /** Selected reward item type, or the quest-defined item value. */
  item: number;
  /**
   * > Unknown.
   */
  slots: SlotObjectData[];
  /** Current protocol tail; observed as zero. */
  unknownShort: number;
  //#endregion

  constructor() {
    this.questId = '';
    this.item = 0;
    this.slots = [];
    this.unknownShort = 0;
  }

  write(writer: Writer): void {
    writer.writeString(this.questId);
    writer.writeInt32(this.item);
    writer.writeShort(this.slots.length);
    for (const slot of this.slots) {
      slot.write(writer);
    }
    writer.writeShort(this.unknownShort);
  }

  read(reader: Reader): void {
    this.questId = reader.readString();
    this.item = reader.readInt32();
    const slotsLen = reader.readShort();
    this.slots = new Array(slotsLen);
    for (let i = 0; i < slotsLen; i++) {
      this.slots[i] = new SlotObjectData();
      this.slots[i].read(reader);
    }
    this.unknownShort = reader.readShort();
  }
}
