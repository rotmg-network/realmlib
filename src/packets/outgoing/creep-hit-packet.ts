import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to report a hit on a creep. Layout from the 6.12.0.2.0 client binary
 * (class `MFJKBPNOBLE`, vtable id 133): field-for-field the same token
 * sequence as `OtherHitPacket` (20) — time, bulletId, objectId, targetId.
 * The C# field stores bulletId as uint32, but every hit packet in this build
 * does that while writing 16 bits on the wire (25/40/90 all parse as int16
 * with zero leftover), so the OtherHit wire convention is mirrored here.
 * No wire capture exists yet.
 */
export class CreepHitPacket implements Packet {
  readonly type = PacketType.CREEP_HIT;

  //#region packet-specific members
  /** The client time of the hit. */
  time: number;
  /** The id of the bullet which hit the creep. */
  bulletId: number;
  /** The object id of the bullet owner. */
  objectId: number;
  /** The object id of the creep which was hit. */
  targetId: number;
  //#endregion

  constructor() {
    this.time = 0;
    this.bulletId = 0;
    this.objectId = 0;
    this.targetId = 0;
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
    this.bulletId = reader.readShort();
    this.objectId = reader.readInt32();
    this.targetId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
    writer.writeShort(this.bulletId);
    writer.writeInt32(this.objectId);
    writer.writeInt32(this.targetId);
  }
}
