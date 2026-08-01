import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { PlayerShootSource } from '../../models';

/**
 * Received when another player shoots a projectile.
 */
export class AllyShootPacket implements Packet {
  readonly type = PacketType.ALLYSHOOT;

  //#region packet-specific members
  /**
   * The bullet id of the projectile which was produced.
   */
  bulletId: number;
  /**
   * The object id of the player who fired the projectile.
   */
  ownerId: number;
  /** The unsigned item id of the weapon used to fire the projectile. */
  containerType: number;
  /** Signed local projectile identifier. */
  projectileId: number;
  /**
   * The angle at which the projectile was fired.
   */
  angle: number;
  /** Unresolved signed shot metadata byte immediately before `shootSource`. */
  unknownShotByte: number;
  /** Whether the projectile came from the primary weapon or an ability. */
  shootSource: PlayerShootSource;
  //#endregion

  constructor() {
    this.bulletId = 0;
    this.ownerId = 0;
    this.containerType = 0;
    this.projectileId = 0;
    this.angle = 0;
    this.unknownShotByte = 0;
    this.shootSource = PlayerShootSource.Primary;
  }

  read(reader: Reader): void {
    this.bulletId = reader.readUnsignedShort();
    this.ownerId = reader.readInt32();
    this.containerType = reader.readUnsignedShort();
    this.projectileId = reader.readByte();
    this.angle = reader.readFloat();
    this.unknownShotByte = reader.readByte();
    this.shootSource = reader.readByte() as PlayerShootSource;
  }

  write(writer: Writer): void {
    writer.writeUnsignedShort(this.bulletId);
    writer.writeInt32(this.ownerId);
    writer.writeUnsignedShort(this.containerType);
    writer.writeByte(this.projectileId);
    writer.writeFloat(this.angle);
    writer.writeByte(this.unknownShotByte);
    writer.writeByte(this.shootSource);
  }

  /** @deprecated Use {@link AllyShootPacket.projectileId}. */
  get unknownByte(): number {
    return this.projectileId;
  }

  set unknownByte(value: number) {
    this.projectileId = value;
  }

  /**
   * Compatibility view which packs `unknownShotByte` and `shootSource` as the
   * signed big-endian short exposed by older RealmLib releases.
   * @deprecated Use `unknownShotByte` and `shootSource` separately.
   */
  get unknownShort(): number {
    const packed = ((this.unknownShotByte & 0xff) << 8) | (this.shootSource & 0xff);
    return packed >= 0x8000 ? packed - 0x10000 : packed;
  }

  set unknownShort(value: number) {
    const packed = value & 0xffff;
    const highByte = packed >>> 8;
    const lowByte = packed & 0xff;
    this.unknownShotByte = highByte >= 0x80 ? highByte - 0x100 : highByte;
    this.shootSource = (lowByte >= 0x80 ? lowByte - 0x100 : lowByte) as PlayerShootSource;
  }
}
