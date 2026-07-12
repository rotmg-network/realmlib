import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to reroll all enchantments on an item. The server acknowledges with an
 * `EnchantPacket` (success) followed by a `VAULT_CONTENT` refresh, all in the
 * same tick.
 *
 * Captured samples: `01 0003 ffff 00` and `01 0000 ffff 00`. The first short
 * therefore varies (3 and 0) — likely the target item's slot/container id —
 * while the leading byte (1), the second short (-1) and the trailing byte (0)
 * are constant. Field meanings still unconfirmed.
 */
export class RerollAllEnchantmentsPacket implements Packet {

  readonly type = PacketType.REROLL_ALL_ENCHANTMENTS;

  //#region packet-specific members
  /**
   * A leading byte (observed as 1). Purpose not yet confirmed.
   */
  unknownByte: number;
  /**
   * A short following the leading byte (observed as 3) — possibly the slot id
   * of the item being rerolled.
   */
  itemSlotId: number;
  /**
   * A second short (observed as -1). Purpose not yet confirmed.
   */
  unknownShort2: number;
  /**
   * A trailing byte (observed as 0). Purpose not yet confirmed.
   */
  unknownByte2: number;
  /** Optional byte observed before the final byte for one reroll mode. */
  optionalByte: number | undefined;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.itemSlotId = 0;
    this.unknownShort2 = 0;
    this.unknownByte2 = 0;
    this.optionalByte = undefined;
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.itemSlotId = reader.readShort();
    this.unknownShort2 = reader.readShort();
    if (reader.remaining > 1) this.optionalByte = reader.readByte();
    this.unknownByte2 = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    writer.writeShort(this.itemSlotId);
    writer.writeShort(this.unknownShort2);
    if (this.optionalByte !== undefined) writer.writeByte(this.optionalByte);
    writer.writeByte(this.unknownByte2);
  }
}
