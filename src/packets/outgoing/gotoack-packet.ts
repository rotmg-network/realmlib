import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to acknowledge a `GotoPacket`.
 */
export class GotoAckPacket implements Packet {

  readonly type = PacketType.GOTOACK;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * Trailing byte added in recent builds. Purpose unknown; sent as 0.
   */
  unknownByte: number;
  //#endregion

  constructor() {
    this.time = 0;
    this.unknownByte = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
    writer.writeByte(this.unknownByte);
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
    this.unknownByte = reader.readByte();
  }
}
