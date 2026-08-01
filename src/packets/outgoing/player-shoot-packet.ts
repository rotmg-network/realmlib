import { WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { PlayerShootSource } from '../../models';

/**
 * Sent when the player shoots a projectile.
 */
export class PlayerShootPacket implements Packet {
  readonly type = PacketType.PLAYERSHOOT;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * The id of the bullet which was fired.
   */
  bulletId: number;
  /** The unsigned item id of the weapon used to fire the projectile. */
  containerType: number;
  /** Unresolved signed shot metadata byte. */
  unknownByte: number;
  /**
   * The position of the starting point where the projectile was fired.
   */
  startingPos: WorldPosData;
  /**
   * The angle at which the projectile was fired.
   */
  angle: number;
  /**
   * Raw burst/projectile index byte.
   *
   * Current traffic uses the complete range `0..24`, rather than only the
   * boolean values `0` and `1` used by older models of this packet.
   */
  burstByte: number;
  /** Unknown signed byte immediately before `shootSource`. */
  unknownShort: number;
  /** Whether the projectile came from the primary weapon or an ability. */
  shootSource: PlayerShootSource;
  /**
   * The Player Position
   */
  playerPos: WorldPosData;

  //#endregion

  constructor() {
    this.time = 0;
    this.bulletId = 0;
    this.containerType = 0;
    this.unknownByte = 0;
    this.startingPos = new WorldPosData();
    this.angle = 0;
    this.burstByte = 0;
    this.unknownShort = 0;
    this.shootSource = PlayerShootSource.Primary;
    this.playerPos = new WorldPosData();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
    writer.writeUnsignedShort(this.bulletId);
    writer.writeUnsignedShort(this.containerType);
    writer.writeByte(this.unknownByte);
    this.startingPos.write(writer);
    writer.writeFloat(this.angle);
    writer.writeUnsignedByte(this.burstByte);
    writer.writeByte(this.unknownShort);
    writer.writeByte(this.shootSource);
    this.playerPos.write(writer);
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
    this.bulletId = reader.readUnsignedShort();
    this.containerType = reader.readUnsignedShort();
    this.unknownByte = reader.readByte();
    this.startingPos.read(reader);
    this.angle = reader.readFloat();
    this.burstByte = reader.readUnsignedByte();
    this.unknownShort = reader.readByte();
    this.shootSource = reader.readByte() as PlayerShootSource;
    this.playerPos.read(reader);
  }

  /**
   * Boolean compatibility view of {@link PlayerShootPacket.burstByte}.
   * Reading this accessor never normalizes a decoded raw value. Assigning it
   * intentionally selects the legacy boolean encodings `0` or `1`.
   * @deprecated Use {@link PlayerShootPacket.burstByte} to preserve the full wire value.
   */
  get isBurst(): boolean {
    return this.burstByte !== 0;
  }

  set isBurst(value: boolean) {
    this.burstByte = value ? 1 : 0;
  }
}
