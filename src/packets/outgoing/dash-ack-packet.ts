import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Acknowledges completion of a Kensei dash. Captures show one acknowledgement
 * per {@link DashPacket}, sent after the local distance/speed travel time.
 */
export class DashAckPacket implements Packet {

  readonly type = PacketType.DASH_ACK;

  //#region packet-specific members
  /** Client time at local dash completion, in milliseconds. */
  time: number;
  //#endregion

  constructor() {
    this.time = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
  }
}
