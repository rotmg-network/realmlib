import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { Writer } from "../../writer";

/**
 * Received when the players exaltation stats update
 */
export class ExaltationUpdatePacket implements Packet {
  readonly type = PacketType.EXALTATION_BONUS_CHANGED;

  /**
   * The object type of the player's class
   */
  objType: number;
  /**
   * The amount of stats to increase
   */
  attackProgress: number;
  defenseProgress: number;
  speedProgress: number;
  dexterityProgress: number;
  vitalityProgress: number;
  wisdomProgress: number;
  healthProgress: number;
  manaProgress: number;

  constructor() {
    this.objType = 0;
    this.attackProgress = 0;
    this.defenseProgress = 0;
    this.speedProgress = 0;
    this.dexterityProgress = 0;
    this.vitalityProgress = 0;
    this.wisdomProgress = 0;
    this.healthProgress = 0;
    this.manaProgress = 0;
  }

  read(reader: Reader): void {
    this.objType = reader.readShort();
    this.dexterityProgress = reader.readCompressedInt();
    this.speedProgress = reader.readCompressedInt();
    this.vitalityProgress = reader.readCompressedInt();
    this.wisdomProgress = reader.readCompressedInt();
    this.defenseProgress = reader.readCompressedInt();
    this.attackProgress = reader.readCompressedInt();
    this.manaProgress = reader.readCompressedInt();
    this.healthProgress = reader.readCompressedInt();
  }

  write(writer: Writer): void {
    writer.writeShort(this.objType);
    writer.writeCompressedInt(this.dexterityProgress);
    writer.writeCompressedInt(this.speedProgress);
    writer.writeCompressedInt(this.vitalityProgress);
    writer.writeCompressedInt(this.wisdomProgress);
    writer.writeCompressedInt(this.defenseProgress);
    writer.writeCompressedInt(this.attackProgress);
    writer.writeCompressedInt(this.manaProgress);
    writer.writeCompressedInt(this.healthProgress);
  }

  toString(): string {
    return `[ExaltationUpdate - 114] ObjectType: ${this.objType}\n` +
      `DEX: ${this.dexterityProgress}\n` +
      `SPD: ${this.speedProgress}\n` +
      `VIT: ${this.vitalityProgress}\n` +
      `WIS: ${this.wisdomProgress}\n` +
      `DEF: ${this.defenseProgress}\n` +
      `ATK: ${this.attackProgress}\n` +
      `MANA: ${this.manaProgress}\n` +
      `LIFE: ${this.healthProgress}`;
  }
}
