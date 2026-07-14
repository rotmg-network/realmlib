import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Starts a Kensei dash along the supplied world-space segment. Captured
 * clients send this after the equipped ability's channel time, then send one
 * {@link DashAckPacket} when local travel is complete.
 */
export class DashPacket implements Packet {

  readonly type = PacketType.DASH;

  //#region packet-specific members
  /** Client time at dash start, in milliseconds. */
  time: number;
  /** World position the dash started from. */
  startX: number;
  startY: number;
  /** World position the dash ends at. */
  endX: number;
  endY: number;
  //#endregion

  constructor() {
    this.time = 0;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
    writer.writeFloat(this.startX);
    writer.writeFloat(this.startY);
    writer.writeFloat(this.endX);
    writer.writeFloat(this.endY);
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
    this.startX = reader.readFloat();
    this.startY = reader.readFloat();
    this.endX = reader.readFloat();
    this.endY = reader.readFloat();
  }
}
