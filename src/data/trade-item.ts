import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';

export class TradeItem implements DataPacket {
  /**
   * The item id
   */
  item: number;
  /**
   * The slot type the item is stored in
   */
  slotType: number;
  /**
   * Whether or not the item is tradeable
   */
  tradeable: boolean;
  /**
   * Whether or not the item is included in an active trade
   */
  included: boolean;
  /**
   * Opaque item metadata sent by the current Exalt build. Captures contain
   * both empty strings and encoded values; its internal semantics are not yet
   * established.
   */
  itemData: string;

  constructor() {
    this.item = 0;
    this.slotType = 0;
    this.tradeable = false;
    this.included = false;
    this.itemData = '';
  }

  read(reader: Reader): void {
    this.item = reader.readInt32();
    this.slotType = reader.readInt32();
    this.tradeable = reader.readBoolean();
    this.included = reader.readBoolean();
    this.itemData = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.item);
    writer.writeInt32(this.slotType);
    writer.writeBoolean(this.tradeable);
    writer.writeBoolean(this.included);
    writer.writeString(this.itemData);
  }

  toString(): string {
    return `[TradeItemData] Item - ${this.item} - SlotType: ${this.slotType}\n
    Tradeable: ${this.tradeable} - Included: ${this.included} - ItemData: ${this.itemData}`;
  }
}
