import { WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when another player shoots
 */
export class ServerPlayerShootPacket implements Packet {

  readonly type = PacketType.SERVERPLAYERSHOOT;

  /**
   * The id of the bullet that was produced
   */
  bulletId: number;
  /**
   * The object id of the player who fired the projectile
   */
  ownerId: number;
  /**
   * The item id of the weapon used to fire the projectile
   */
  containerType: number;
  /**
   * The starting position of the projectile
   */
  startingPos: WorldPosData;
  /**
   * The angle at which the projectile was fired
   */
  angle: number;
  /**
   * The damage which will be dealt by the projectile
   */
  damage: number;

  unknownInt: number;

  unknownByte: number;
  
  spellBomb: boolean;
  
  bulletCount: number;
  
  bulletAngle: number;

  constructor() {
    this.bulletId = 0;
    this.ownerId = 0;
    this.containerType = 0;
    this.startingPos = new WorldPosData();
    this.angle = 0;
    this.damage = 0;
    this.unknownInt = 0;
    this.unknownByte = 0;
    this.spellBomb = false;
    this.bulletCount = 0;
    this.bulletAngle = 0;
  }

  read(reader: Reader): void {
    this.bulletId = reader.readUnsignedShort();
    this.ownerId = reader.readInt32();
    this.containerType = reader.readInt32();
    this.startingPos.read(reader);
    this.angle = reader.readFloat();
    this.damage = reader.readShort();
    this.unknownInt = reader.readInt32();
    this.unknownByte = reader.readByte();

    if (reader.remaining > 0) {
      this.spellBomb = true;
      this.bulletCount = reader.readByte();
      this.bulletAngle = reader.readFloat();
    } else {
      this.bulletCount = 0;
      this.bulletAngle = 0;
    }
  }

  write(writer: Writer): void {
    writer.writeUnsignedShort(this.bulletId);
    writer.writeInt32(this.ownerId);
    writer.writeInt32(this.containerType);
    this.startingPos.write(writer);
    writer.writeFloat(this.angle);
    writer.writeShort(this.damage);
    writer.writeInt32(this.unknownInt);
    writer.writeByte(this.unknownByte);

    if (this.spellBomb) {
      writer.writeByte(this.bulletCount);
      writer.writeFloat(this.bulletAngle);
    }
  }

  toString(): string {
    return `[ServerPlayerShoot] BulletId: ${this.bulletId}\n
    OwnerId: ${this.ownerId}\n
    ContainerType: ${this.containerType}\n
    StartingPos: ${this.startingPos.toString()}\n
    Angle: ${this.angle}\nDamage: ${this.damage}\n
    UnknownInt: ${this.unknownInt}\n
    UnknownByte: ${this.unknownByte}\n
    SpellBomb: ${this.spellBomb}\n
    BulletCount: ${this.bulletCount}\n
    BulletAngle: ${this.bulletAngle}`;
  }
}
