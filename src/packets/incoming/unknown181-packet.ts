import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Packet 181, server -> client. A single byte (observed as 1) whose meaning is
 * not yet known; it followed crucible activity in the 2026-07-26 capture.
 * Defined so the id is consumed rather than falling through unparsed.
 */
export class Unknown181Packet implements Packet {

  readonly type = PacketType.UNKNOWN181;

  //#region packet-specific members
  /** The single body byte (observed as 1). */
  value: number;
  //#endregion

  constructor() {
    this.value = 0;
  }

  read(reader: Reader): void {
    this.value = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeByte(this.value);
  }
}
