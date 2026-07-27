import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received with the outcome of a gift operation. Layout from the 6.12.0.2.0
 * client binary (class `IHOKIPJNGEL`, incoming factory id 227): result bool,
 * a second bool, and three strings. `ShopManager` references this class in
 * the same method as the strings "gift.Error" / "UnknownErrorOccured", which
 * is what names it (catalog `GiftResultMessage`). The non-result fields
 * cannot be named from the dump. No wire capture exists yet.
 */
export class GiftResultPacket implements Packet {

  readonly type = PacketType.GIFT_RESULT;

  //#region packet-specific members
  /** Whether the gift operation succeeded. */
  result: boolean;
  /** Second bool. Purpose unknown. */
  unknownBool: boolean;
  /** First string. Purpose unknown. */
  unknownString: string;
  /** Second string. Purpose unknown. */
  unknownString2: string;
  /** Third string. Purpose unknown. */
  unknownString3: string;
  //#endregion

  constructor() {
    this.result = false;
    this.unknownBool = false;
    this.unknownString = '';
    this.unknownString2 = '';
    this.unknownString3 = '';
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
    this.unknownBool = reader.readBoolean();
    this.unknownString = reader.readString();
    this.unknownString2 = reader.readString();
    this.unknownString3 = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
    writer.writeBoolean(this.unknownBool);
    writer.writeString(this.unknownString);
    writer.writeString(this.unknownString2);
    writer.writeString(this.unknownString3);
  }
}
