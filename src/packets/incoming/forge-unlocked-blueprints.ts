import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';

/**
 * Received when the player enters the nexus
 */
export class ForgeUnlockedBlueprints implements Packet {
  readonly type = PacketType.FORGE_UNLOCKED_BLUEPRINTS;

  /** Unresolved flag preceding the unlocked blueprint list. */
  unknownFlag: boolean;
  /**
   * The itemIds of unlocked blueprints in an array
   */
  unlockedBlueprints: number[];

  constructor() {
    this.unknownFlag = false;
    this.unlockedBlueprints = [];
  }

  read(reader: Reader): void {
    this.unknownFlag = reader.readBoolean();
    const count = reader.validateCollectionCount(
      reader.readCompressedInt(),
      1,
      'unlocked blueprints',
    );
    this.unlockedBlueprints = new Array(count);
    for (let i = 0; i < count; i++) {
      this.unlockedBlueprints[i] = reader.readCompressedInt();
    }
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.unknownFlag);
    writer.writeCompressedInt(this.unlockedBlueprints.length);
    for (let i = 0; i < this.unlockedBlueprints.length; i++) {
      writer.writeCompressedInt(this.unlockedBlueprints[i]);
    }
  }

  /** @deprecated Use `unknownFlag`. */
  get unknownByte(): number {
    return this.unknownFlag ? 1 : 0;
  }

  set unknownByte(value: number) {
    this.unknownFlag = value !== 0;
  }

  toString(): string {
    let str = `[ForgeUnlockedBlueprints]:\n`;
    if (this.unlockedBlueprints.length === 0) {
      return str + 'no unlocked blueprints';
    }
    for (let i = 0; i < this.unlockedBlueprints.length; i++) {
      str += `[${i}] ${this.unlockedBlueprints[i]}\n`;
    }
    return str;
  }
}
