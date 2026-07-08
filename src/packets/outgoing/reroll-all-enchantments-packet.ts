import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to reroll all enchantments on an item. The server acknowledges with an
 * `EnchantPacket` followed by a `VAULT_CONTENT` refresh.
 *
 * All captured samples were the identical 6 bytes `01 0003 ffff 00`, so the
 * field meanings are not yet confirmed.
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
  unknownShort: number;
  /**
   * A second short (observed as -1). Purpose not yet confirmed.
   */
  unknownShort2: number;
  /**
   * A trailing byte (observed as 0). Purpose not yet confirmed.
   */
  unknownByte2: number;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.unknownShort = 0;
    this.unknownShort2 = 0;
    this.unknownByte2 = 0;
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.unknownShort = reader.readShort();
    this.unknownShort2 = reader.readShort();
    this.unknownByte2 = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    writer.writeShort(this.unknownShort);
    writer.writeShort(this.unknownShort2);
    writer.writeByte(this.unknownByte2);
  }
}
