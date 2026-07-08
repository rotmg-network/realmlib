import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 232 (client -> server). Observed as a string followed
 * by an int32 that increments across a burst (a request/sequence id); the
 * server replies per entry with a `Unknown233Packet` carrying a reward
 * descriptor string. Appears to walk a redeemable-reward catalogue.
 */
export class Unknown232Packet implements Packet {

  readonly type = PacketType.UNKNOWN232;

  //#region packet-specific members
  /** A short string payload (observed values like "1", "1,", "1,2"). */
  value: string;
  /** An int32 sequence/request id (increments across a burst). */
  sequence: number;
  //#endregion

  constructor() {
    this.value = '';
    this.sequence = 0;
  }

  read(reader: Reader): void {
    this.value = reader.readString();
    this.sequence = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeString(this.value);
    writer.writeInt32(this.sequence);
  }
}
