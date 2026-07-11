import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
import { StatType } from '../models';

/**
 * One entry in an object's stat list: a {@link StatType}, its value, and a
 * secondary value. Whether the value is a string or a compressed int is decided
 * by the stat type ({@link isStringStat}) — the wire format has no type tag, so
 * read and write must agree on which stats are strings.
 */
export class StatData implements DataPacket {
  /**
   * The type of stat
   */
  statType: number;
  /**
   * The number value of this stat, if this is not a string stat
   */
  statValue: number;
  /**
   * The string value of this stat, if this is a string stat
   */
  stringStatValue: string;
  /**
   * The secondary stat value
   */
  statValueTwo: number;

  constructor() {
    this.statType = 0;
    this.statValue = 0;
    this.stringStatValue = '';
    this.statValueTwo = 0;
  }

  read(reader: Reader): void {
    this.statType = reader.readUnsignedByte();
    if (this.isStringStat()) {
      this.stringStatValue = reader.readString();
    } else {
      this.statValue = reader.readCompressedInt();
    }
    this.statValueTwo = reader.readCompressedInt();
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.statType);
    if (this.isStringStat()) {
      writer.writeString(this.stringStatValue);
    } else {
      writer.writeCompressedInt(this.statValue);
    }
    writer.writeCompressedInt(this.statValueTwo);
  }

  toString(): string {
    return `[StatData] Type: ${this.statToName(this.statType)} - Value: ${this.statValue} (extra byte: ${this.statValueTwo})`;
  }

  /**
   * Return whether or not the current stat has a string value
   */
  isStringStat(): boolean {
    switch (this.statType) {
      case StatType.EXP_STAT:
      case StatType.NAME_STAT:
      case StatType.ACCOUNT_ID_STAT:
      case StatType.OWNER_ACCOUNT_ID_STAT:
      case StatType.GUILD_NAME_STAT:
      case StatType.MATERIAL_AMOUNT_STAT:
      case StatType.MATERIAL_CAP_STAT:
      case StatType.ENCHANTMENTS_STAT:
      case StatType.PET_NAME_STAT:
      case StatType.GRAVE_ACCOUNT_ID:
      case StatType.MODIFIERS_STAT:
      case StatType.DUST_AMOUNT_STAT:
      case StatType.CRUCIBLE_STAT:
      case StatType.DUST_CAP_STAT:
      case StatType.UNKNOWN_155:
        return true;
      default:
        return false;
    }
  }

  /**
   * Return the name of a current stat or another stat based on it's value
   * @param statType The ID of the stat type (optional)
   */
  statToName(statType: number = this.statType): string {
    return StatType[statType] ?? `Unknown ${statType}`;
  }
}
