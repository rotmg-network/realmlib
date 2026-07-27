import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Packet 198, client -> server. Layout from the 6.12.0.2.0 client binary
 * (class `JGBMCJKMKEC`): a single UTF string whose field token is unique to
 * this class — no naming evidence survives. Possibly the request half of the
 * incoming bool result 199. No wire capture exists yet.
 */
export class Unknown198Packet implements Packet {

  readonly type = PacketType.UNKNOWN198;

  //#region packet-specific members
  /** The single string body. Purpose unknown. */
  unknownString: string;
  //#endregion

  constructor() {
    this.unknownString = '';
  }

  read(reader: Reader): void {
    this.unknownString = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.unknownString);
  }
}
