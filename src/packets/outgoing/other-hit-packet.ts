import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent when an object or other player has been hit by an enemy projectile.
 */
export class OtherHitPacket implements Packet {

  readonly type = PacketType.OTHERHIT;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * The id of the bullet which hit the object.
   */
  bulletId: number;
  /**
   * The object id of player who fired the projectile which hit the object.
   */
  objectId: number;
  /**
   * The object id of the object which was hit.
   */
  targetId: number;
  //#endregion

  constructor() {
    this.time = 0;
    this.bulletId = 0;
    this.objectId = 0;
    this.targetId = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
    writer.writeShort(this.bulletId);
    writer.writeInt32(this.objectId);
    writer.writeInt32(this.targetId);
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
    this.bulletId = reader.readShort();
    this.objectId = reader.readInt32();
    this.targetId = reader.readInt32();
  }
}
