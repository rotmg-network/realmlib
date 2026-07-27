import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Packet 199, server -> client. Layout from the 6.12.0.2.0 client binary
 * (class `EPPLCHDEMIC`, incoming factory id 199): a single result bool with
 * no surviving listener — most plausibly the result of outgoing 197
 * (`SELECT_ENTRANCE`) or 198. No wire capture exists yet.
 */
export class Unknown199Packet implements Packet {

  readonly type = PacketType.UNKNOWN199;

  //#region packet-specific members
  /** Result flag. */
  result: boolean;
  //#endregion

  constructor() {
    this.result = false;
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
  }
}
