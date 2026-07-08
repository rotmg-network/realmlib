import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 233 (server -> client), sent in response to
 * `Unknown232Packet`. The body is a leading byte, a second byte that matches
 * the sequence id from the request, and a descriptor string such as
 * `boost_exp:3`, `item:Beginner Weapon`, `char_start_with:all:1:T1`,
 * `fame:200`.
 */
export class Unknown233Packet implements Packet {

  readonly type = PacketType.UNKNOWN233;

  //#region packet-specific members
  /** A leading byte (observed as 1). Purpose not yet confirmed. */
  unknownByte: number;
  /** The sequence id (matches the int32 sent in packet 232). */
  sequence: number;
  /** A reward/entry descriptor string (e.g. `fame:200`). */
  descriptor: string;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.sequence = 0;
    this.descriptor = '';
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.sequence = reader.readByte();
    this.descriptor = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    writer.writeByte(this.sequence);
    writer.writeString(this.descriptor);
  }
}
