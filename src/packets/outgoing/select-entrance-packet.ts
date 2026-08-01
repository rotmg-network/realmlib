import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to select a player entrance effect. The body is a single int32
 * with the entrance ID or -1 for the default entrance.
 */
export class SelectEntrancePacket implements Packet {
  readonly type = PacketType.SELECT_ENTRANCE;

  //#region packet-specific members
  /**
   * The id of the selected entrance, or -1.
   */
  entranceId: number;
  //#endregion

  constructor() {
    this.entranceId = -1;
  }

  read(reader: Reader): void {
    this.entranceId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.entranceId);
  }
}
