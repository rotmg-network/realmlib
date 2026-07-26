import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Enchanter upgrade state (packet 185).
 *
 * The most frequent previously-unparsable packet in the 2026-07-26 capture:
 * 358 samples, all exactly 9 bytes, all of the same shape:
 * `int32 value`, `int32 itemType`, `byte flag`.
 *
 * `itemType` was 0x0A9C (2716) and `flag` was 0 in every sample, while `value`
 * varied (117, 22, 23, ...). The fields are named conservatively because with
 * two of the three constant across the capture their exact meaning is not yet
 * provable — but parsing it stops 358 packets a session falling through.
 */
export class UpgradeEnchanterPacket implements Packet {

  readonly type = PacketType.UPGRADE_ENCHANTER;

  //#region packet-specific members
  /** Varies per sample; meaning not yet confirmed. */
  value: number;
  /** Object type of the enchanter item (0x0A9C in every observed sample). */
  itemType: number;
  /** Trailing flag byte (0 in every observed sample). */
  flag: number;
  //#endregion

  constructor() {
    this.value = 0;
    this.itemType = 0;
    this.flag = 0;
  }

  read(reader: Reader): void {
    this.value = reader.readInt32();
    this.itemType = reader.readInt32();
    this.flag = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.value);
    writer.writeInt32(this.itemType);
    writer.writeByte(this.flag);
  }
}
