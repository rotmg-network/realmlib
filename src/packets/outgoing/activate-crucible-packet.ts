import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to activate a crucible (packet 180).
 *
 * Body observed in the 2026-07-26 capture: a UTF string of digits
 * (`'6646626776023040'`) followed by a trailing short.
 */
export class ActivateCruciblePacket implements Packet {
  readonly type = PacketType.ACTIVATE_CRUCIBLE;

  //#region packet-specific members
  /** Identifier of the crucible being activated. */
  crucibleId: string;
  /** Trailing short (0 in the observed sample). */
  trailing: number;
  //#endregion

  constructor() {
    this.crucibleId = '';
    this.trailing = 0;
  }

  read(reader: Reader): void {
    this.crucibleId = reader.readString();
    this.trailing = reader.remaining >= 2 ? reader.readShort() : 0;
  }

  write(writer: Writer): void {
    writer.writeString(this.crucibleId);
    writer.writeShort(this.trailing);
  }
}
