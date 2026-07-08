import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 224 (client -> server). The body is a single int32
 * (observed as 51); the server immediately echoes the same value back in a
 * `NotificationPacket` with effect 18, which suggests some kind of
 * claim/acknowledge with an id.
 */
export class Unknown224Packet implements Packet {

  readonly type = PacketType.UNKNOWN224;

  //#region packet-specific members
  /**
   * An int32 echoed back by the server in an effect-18 notification.
   * Purpose not yet confirmed.
   */
  unknownInt: number;
  //#endregion

  constructor() {
    this.unknownInt = 0;
  }

  read(reader: Reader): void {
    this.unknownInt = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.unknownInt);
  }
}
