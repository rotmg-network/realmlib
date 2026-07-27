import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Packet 116, server -> client. Layout from the 6.12.0.2.0 client binary
 * (class `AKPFCJOAINE`, incoming factory id 116): a generic result — bool
 * plus message string (both field tokens match the "result"/"message" tokens
 * used across this build's result packets). The class has no listener
 * anywhere in the client, so there is no naming evidence; given its id sits
 * right after `REDEEM_EXALTATION_REWARD` (115), the catalog's
 * `ExaltationRedeemInfoMessage` is a candidate, but that is adjacency only.
 * No wire capture exists yet.
 */
export class Unknown116Packet implements Packet {

  readonly type = PacketType.UNKNOWN116;

  //#region packet-specific members
  /** Result flag. */
  result: boolean;
  /** Message payload. */
  message: string;
  //#endregion

  constructor() {
    this.result = false;
    this.message = '';
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
    this.message = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
    writer.writeString(this.message);
  }
}
