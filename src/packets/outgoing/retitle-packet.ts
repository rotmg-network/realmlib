import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to change the character's equipped title(s). The body is two int32
 * title ids, one per title slot; `0` clears a slot.
 *
 * Captured examples: `0 0` (clear both), `0x9a01 0` (one title),
 * `0x9a0a 0x9a12` (two titles). The ids index the client's title definitions.
 */
export class RetitlePacket implements Packet {

  readonly type = PacketType.RETITLE;

  //#region packet-specific members
  /** The primary title slot's id (0 = none). */
  titleId: number;
  /** The secondary title slot's id (0 = none). */
  secondaryTitleId: number;
  //#endregion

  constructor() {
    this.titleId = 0;
    this.secondaryTitleId = 0;
  }

  read(reader: Reader): void {
    this.titleId = reader.readInt32();
    this.secondaryTitleId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.titleId);
    writer.writeInt32(this.secondaryTitleId);
  }
}
