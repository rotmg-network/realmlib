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
   * The itemIds of unlocked blueprints in an array
   */
  unlockedBlueprints: number[];

  constructor() {
    this.unlockedBlueprints = [];
  }

  read(reader: Reader): void {
    let count = reader.readByte();
    for (let i = 0; i < count; i++) {
      this.unlockedBlueprints.push(new CompressedInt().read(reader));
    }
  }

  write(writer: Writer): void {
    writer.writeByte(this.unlockedBlueprints.length);
    for (let i = 0; i < this.unlockedBlueprints.length; i++) {
      new CompressedInt().write(writer, (this.unlockedBlueprints[i]));
    }
  }

  toString(): string {
    let str = `FORGE_UNLOCKED_BLUEPRINTS:\n`;
    if (this.unlockedBlueprints.length == 0) {
      return str + 'no unlocked blueprints'
    }
    for(let i = 0; i < this.unlockedBlueprints.length; i++) {
      str += `[${i}] ${this.unlockedBlueprints[i]}`;
    }
    return str;
  }
}
