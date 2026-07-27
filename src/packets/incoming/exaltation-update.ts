import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { Writer } from "../../writer";

/**
 * Received once per connection for the character being loaded.
 *
 * Despite the packet's name this carries the account's per-class POWER-UP
 * (stat-potion) totals, not exaltations. A 2026-07-27 session decodes the
 * Samurai body to [118, 84, 96, 82, 135, 137, 150, 96] and the Wizard body to
 * [99, 1467, 150, 134, 151, 143, 149, 152]; the same session's
 * `/account/listPowerUpStats` returns `<ClassPowerup><Class>785</Class>
 * <Dex>118</Dex><Spd>84</Spd><Vit>96</Vit><Wis>82</Wis><Def>135</Def>
 * <Att>137</Att><Mana>150</Mana><Life>96</Life></ClassPowerup>` and Class 782
 * with `<Spd>1467</Spd>`. Same eight numbers, same order, same outlier — which
 * confirms both the read order below and the meaning against an independent
 * source.
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

/**
 * Semantic alias for {@link ExaltationUpdatePacket}: id 114 carries per-class
 * power-up (stat-potion) totals, not exaltation data. Use this name so consumers
 * stop reaching for the packet expecting exaltation state. The wire type stays
 * {@link PacketType.EXALTATION_BONUS_CHANGED} (the id's catalog name).
 */
export const PowerUpStatsPacket = ExaltationUpdatePacket;
export type PowerUpStatsPacket = ExaltationUpdatePacket;
