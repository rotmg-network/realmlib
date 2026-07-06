import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent when an enemy has been hit by the player.
 */
export class EnemyHitPacket implements Packet {

  readonly type = PacketType.ENEMYHIT;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * The id of the bullet which hit the enemy (RealmShark: `bulletId`, a short).
   */
  bulletId: number;
  /**
   * The object id of the shooter (RealmShark: `shooterID`).
   */
  shooterId: number;
  /**
   * The object id of the enemy which was hit.
   */
  targetId: number;
  /**
   * Whether or not the projectile will kill the enemy.
   */
  kill: boolean;
  /**
   * Trailing object id (RealmShark: `mainID`).
   */
  mainId: number;
  //#endregion

  constructor() {
    this.time = 0;
    this.bulletId = 0;
    this.shooterId = 0;
    this.targetId = 0;
    this.kill = false;
    this.mainId = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
    writer.writeShort(this.bulletId);
    writer.writeInt32(this.shooterId);
    writer.writeInt32(this.targetId);
    writer.writeBoolean(this.kill);
    writer.writeInt32(this.mainId);
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
    this.bulletId = reader.readShort();
    this.shooterId = reader.readInt32();
    this.targetId = reader.readInt32();
    this.kill = reader.readBoolean();
    this.mainId = reader.readInt32();
  }
}
