import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to select a dungeon entrance. The body is a single int32, observed as
 * `-1` in all captured samples (possibly "default entrance").
 */
export class SelectEntrancePacket implements Packet {

  readonly type = PacketType.SELECT_ENTRANCE;

  //#region packet-specific members
  /**
   * The id of the selected entrance, or -1 (the only observed value; exact
   * semantics not yet confirmed).
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
