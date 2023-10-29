import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
import { CompressedInt } from './compressed-int';
import { StatType } from '../models';

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
      case StatType.NAME_STAT:
      case StatType.GUILD_NAME_STAT:
      case StatType.PET_NAME_STAT:
      case StatType.ACCOUNT_ID_STAT:
      case StatType.OWNER_ACCOUNT_ID_STAT:
      case StatType.GRAVE_ACCOUNT_ID:
      case StatType.TEXTURE_STAT:
      case StatType.UNKNOWN128:
      case StatType.UNKNOWN121:
      case StatType.ENCHANTMENT:
      case StatType.EXP_STAT:
        return true;
      default:
        return false;
    }
  }

  /**
   * Return the name of a current stat or another stat based on it's value
   * @param statType The ID of the stat type (optional)
   */
  statToName(statType: number = -1): string {
    let keys = Object.keys(StatType).map(key => StatType[key]).filter(value => typeof value === 'string') as string[];
    let values = Object.values(StatType);
    let index: number;

    if (statType === -1) {
      index = values.findIndex(value => value === this.statType);
    } else {
      index = values.findIndex(value => value === statType);
    }

    if (index === -1) {
      return `Unknown ${(statType === -1) ? this.statType : statType}`;
    } else {
      return keys[index];
    }
  }
}
