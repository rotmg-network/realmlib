import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when a condition effect with a magnitude is applied — a `Damage`
 * body followed by an effect id and a float value. Client class
 * `AHOLOBFDLMN : Damage` (= the catalog's `DamageWithEffect`), bound to id 166
 * in the client's incoming message factory.
 *
 * Id 166 was carried in realmlib as `STASIS` (a pyrelay-era name). Captures
 * confirm that it is generic: the leading effect list can contain Curse (38)
 * while the magnitude-bearing trailing effect is Stasis (22). A stasis sample:
 * `000003af 01 16 0000 00 0000 00ffffff 16 40e00000` = target 943, effects
 * [22 = Stasis], 0 damage, no bullet, owner 0xffffff (sentinel), effect 22,
 * value 7.0. The value counts down across updates for the same target
 * (7.0 → ~2.98) and 0.0 clears it, so for stasis it is the remaining duration
 * in seconds.
 */
export class DamageWithEffectPacket implements Packet {
  readonly type = PacketType.DAMAGE_WITH_EFFECT;

  //#region packet-specific members
  /** The object id of the entity receiving the damage/effect. */
  targetId: number;
  /** Status effects applied with the damage (observed 22 = Stasis, 38 = Curse). */
  effects: number[];
  /** The amount of damage taken (0 in all captures). */
  damageAmount: number;
  /** Damage flags byte — see the `DamageFlags` enum. */
  info: number;
  /** The id of the bullet which caused the damage (0 when effect-only). */
  bulletId: number;
  /** Owner of the bullet; `0xffffff` sentinel when there is no bullet. */
  objectId: number;
  /** The condition-effect index the value applies to. */
  effectId: number;
  /** Effect magnitude; remaining duration in seconds for stasis. */
  value: number;
  //#endregion

  constructor() {
    this.targetId = 0;
    this.effects = [];
    this.damageAmount = 0;
    this.info = 0;
    this.bulletId = 0;
    this.objectId = 0;
    this.effectId = 0;
    this.value = 0;
  }

  read(reader: Reader): void {
    this.targetId = reader.readInt32();
    const effectsLen = reader.validateCollectionCount(
      reader.readUnsignedByte(),
      1,
      'damage effects',
    );
    this.effects = new Array<number>(effectsLen);
    for (let i = 0; i < effectsLen; i++) {
      this.effects[i] = reader.readUnsignedByte();
    }
    this.damageAmount = reader.readUnsignedShort();
    this.info = reader.readByte();
    this.bulletId = reader.readUnsignedShort();
    this.objectId = reader.readInt32();
    this.effectId = reader.readUnsignedByte();
    this.value = reader.readFloat();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.targetId);
    writer.writeUnsignedByte(this.effects.length);
    for (const effect of this.effects) {
      writer.writeUnsignedByte(effect);
    }
    writer.writeUnsignedShort(this.damageAmount);
    writer.writeByte(this.info);
    writer.writeUnsignedShort(this.bulletId);
    writer.writeInt32(this.objectId);
    writer.writeUnsignedByte(this.effectId);
    writer.writeFloat(this.value);
  }
}
