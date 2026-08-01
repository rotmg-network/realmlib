import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to redeem an exaltation reward. Layout from the 6.12.0.2.0 client
 * binary (class `LCFAPBCAJPG`, vtable id 115): a single int32. No wire capture
 * exists yet. Current constructor/setter dataflow and the owning chest manager
 * identify the value as an item id.
 */
export class RedeemExaltationRewardPacket implements Packet {
  readonly type = PacketType.REDEEM_EXALTATION_REWARD;

  //#region packet-specific members
  /** Item type identifying the reward/chest entry to redeem. */
  itemId: number;
  //#endregion

  constructor() {
    this.itemId = 0;
  }

  /** @deprecated Use {@link RedeemExaltationRewardPacket.itemId}. */
  get unknownInt(): number {
    return this.itemId;
  }

  set unknownInt(value: number) {
    this.itemId = value;
  }

  read(reader: Reader): void {
    this.itemId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.itemId);
  }
}
