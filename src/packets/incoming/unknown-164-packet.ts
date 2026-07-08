import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 164 (server -> client). Reverse-engineered from a
 * single 4-byte sample (`01 01 0000`); read as two bytes and a short. Field
 * meanings are not yet confirmed.
 */
export class Unknown164Packet implements Packet {

  readonly type = PacketType.UNKNOWN164;

  //#region packet-specific members
  /** A leading byte (observed as 1). */
  unknownByte: number;
  /** A second byte (observed as 1). */
  unknownByte2: number;
  /** A trailing short (observed as 0). */
  unknownShort: number;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.unknownByte2 = 0;
    this.unknownShort = 0;
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.unknownByte2 = reader.readByte();
    this.unknownShort = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    writer.writeByte(this.unknownByte2);
    writer.writeShort(this.unknownShort);
  }
}
