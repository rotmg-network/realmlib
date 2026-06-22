import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Acknowledges a dash. Carries only the current client time.
 */
export class DashAckPacket implements Packet {

  readonly type = PacketType.DASH_ACK;

  //#region packet-specific members
  /** The current client time. */
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
