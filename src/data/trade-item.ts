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

  constructor() {
    this.item = 0;
    this.slotType = 0;
    this.tradeable = false;
    this.included = false;
  }

  read(reader: Reader): void {
    this.item = reader.readInt32();
    this.slotType = reader.readInt32();
    this.tradeable = reader.readBoolean();
    this.included = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.item);
    writer.writeInt32(this.slotType);
    writer.writeBoolean(this.tradeable);
    writer.writeBoolean(this.included);
  }

  toString(): string {
    return `[TradeItemData] Item - ${this.item} - SlotType: ${this.slotType}\n
    Tradeable: ${this.tradeable} - Included: ${this.included}`;
  }
}
