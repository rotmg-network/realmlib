import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to tell the player about damage done to other players and enemies.
 */
export class DamagePacket implements Packet {

  readonly type = PacketType.DAMAGE;

  //#region packet-specific members
  /**
   * The object id of the entity receiving the damage.
   */
  targetId: number;
  /**
   * An array of status effects which were applied with the damage.
   */
  effects: number[];
  /**
   * The amount of damage taken.
   */
  damageAmount: number;
  /**
   * Damage flags (kill, armor pierce, etc.) packed into a single byte.
   */
  info: number;
  /**
   * The id of the bullet which caused the damage.
   */
  bulletId: number;
  /**
   * The object id of the entity which owned the bullet that caused the damage.
   */
  objectId: number;
  //#endregion

  constructor() {
    this.targetId = 0;
    this.effects = [];
    this.damageAmount = 0;
    this.info = 0;
    this.bulletId = 0;
    this.objectId = 0;
  }

  read(reader: Reader): void {
    this.targetId = reader.readInt32();
    const effectsLen = reader.readUnsignedByte();
    this.effects = new Array<number>(effectsLen);
    for (let i = 0; i < effectsLen; i++) {
      this.effects[i] = reader.readUnsignedByte();
    }
    this.damageAmount = reader.readUnsignedShort();
    this.info = reader.readByte();
    this.bulletId = reader.readUnsignedShort();
    this.objectId = reader.readInt32();
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
  }
}
