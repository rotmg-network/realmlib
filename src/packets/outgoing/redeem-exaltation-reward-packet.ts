import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to redeem an exaltation reward. Layout from the 6.12.0.2.0 client
 * binary (class `LCFAPBCAJPG`, vtable id 115): a single int32. No wire capture
 * exists yet. The field's obfuscated name appears in `ItemSlot`/`TradeSlot`
 * next to object properties, suggesting an item/object type, but that is not
 * conclusive — hence the unknown name.
 */
export class RedeemExaltationRewardPacket implements Packet {
  readonly type = PacketType.REDEEM_EXALTATION_REWARD;

  //#region packet-specific members
  /** The single int32 body; likely an object/item type, unconfirmed. */
  unknownInt: number;
  //#endregion

  constructor() {
    this.unknownInt = 0;
  }

  read(reader: Reader): void {
    this.unknownInt = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.unknownInt);
  }
}
