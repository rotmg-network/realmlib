import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 235 (server -> client), sent in response to
 * `Unknown234Packet`. The body is a leading byte followed by a string holding
 * an XML reward payload, e.g.
 * `<Success><Tier>1</Tier><Rewards><Item><Id>3177</Id>...`.
 */
export class Unknown235Packet implements Packet {

  readonly type = PacketType.UNKNOWN235;

  //#region packet-specific members
  /** A leading byte (observed as 1). Likely a success flag. */
  unknownByte: number;
  /** The XML reward payload. */
  xml: string;
  /** A trailing short (observed as 0). Purpose not yet confirmed. */
  unknownShort: number;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.xml = '';
    this.unknownShort = 0;
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.xml = reader.readString();
    this.unknownShort = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    writer.writeString(this.xml);
    writer.writeShort(this.unknownShort);
  }
}
