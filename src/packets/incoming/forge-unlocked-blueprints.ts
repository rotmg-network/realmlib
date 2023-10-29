import { Reader } from "../../reader";
import { Writer } from "../../writer";
import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { CompressedInt } from '../../data';

/**
 * Received when the player enters the nexus
 */
export class ForgeUnlockedBlueprints implements Packet {
  readonly type = PacketType.FORGE_UNLOCKED_BLUEPRINTS;

  /**
   * No fucking idea
   */
  unknownByte: number;
  /**
   * The itemIds of unlocked blueprints in an array
   */
  unlockedBlueprints: number[];

  constructor() {
    this.unlockedBlueprints = [];
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    let count = reader.readCompressedInt();
    for (let i = 0; i < count; i++) {
      this.unlockedBlueprints.push(reader.readCompressedInt());
    }
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    writer.writeCompressedInt(this.unlockedBlueprints.length);
    for (let i = 0; i < this.unlockedBlueprints.length; i++) {
      writer.writeCompressedInt(this.unlockedBlueprints[i]);
    }
  }

  toString(): string {
    let str = `[ForgeUnlockedBlueprints]:\n`;
    if (this.unlockedBlueprints.length == 0) {
      return str + 'no unlocked blueprints'
    }
    for(let i = 0; i < this.unlockedBlueprints.length; i++) {
      str += `[${i}] ${this.unlockedBlueprints[i]}\n`;
    }
    return str;
  }
}
