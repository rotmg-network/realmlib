import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Packet 226, client -> server. Layout from the 6.12.0.2.0 client binary
 * (class `MBLDHCMPCKC`): two UTF strings. Adjacency with the gift cluster
 * (227 `GIFT_RESULT`, 238 `GIFT_NOTIFICATION`) makes the catalog's
 * `GiftItemsMessage` the leading candidate name, but two bare strings is an
 * odd shape for a gift (no item ids), so the packet stays unnamed until a
 * capture settles it. No wire capture exists yet.
 */
export class Unknown226Packet implements Packet {

  readonly type = PacketType.UNKNOWN226;

  //#region packet-specific members
  /** First string. Purpose unknown. */
  unknownString: string;
  /** Second string. Purpose unknown. */
  unknownString2: string;
  //#endregion

  constructor() {
    this.unknownString = '';
    this.unknownString2 = '';
  }

  read(reader: Reader): void {
    this.unknownString = reader.readString();
    this.unknownString2 = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.unknownString);
    writer.writeString(this.unknownString2);
  }
}
