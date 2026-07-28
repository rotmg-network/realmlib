import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to buy an item.
 */
export class BuyPacket implements Packet {
  type = PacketType.BUY;

  //#region packet-specific members
  /**
   * The object type of the item being purchased.
   */
  objectType: number;
  /**
   * The number of items being purchased.
   */
  quantity: number;
  //#endregion

  constructor() {
    this.objectType = 0;
    this.quantity = 0;
  }

  /**
   * Backward-compatible alias for {@link BuyPacket.objectType}.
   * @deprecated Packet 85 carries an object type, not a world object id.
   */
  get objectId(): number {
    return this.objectType;
  }

  set objectId(value: number) {
    this.objectType = value;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectType);
    writer.writeInt32(this.quantity);
  }

  read(reader: Reader): void {
    this.objectType = reader.readInt32();
    this.quantity = reader.readInt32();
  }
}
