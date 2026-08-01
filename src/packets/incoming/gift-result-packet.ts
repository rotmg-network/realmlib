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
 * remain raw except that the third string is the displayed failure message.
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
  /** Displayed failure message. */
  errorMessage: string;
  //#endregion

  constructor() {
    this.result = false;
    this.unknownBool = false;
    this.unknownString = '';
    this.unknownString2 = '';
    this.errorMessage = '';
  }

  /** @deprecated Use {@link GiftResultPacket.errorMessage}. */
  get unknownString3(): string {
    return this.errorMessage;
  }

  set unknownString3(value: string) {
    this.errorMessage = value;
  }

  /**
   * Parses the first raw string as semicolon-separated records of comma-separated
   * decimal item types. The raw string is never changed. Returns `undefined`
   * rather than partially accepting a malformed record.
   */
  parseItemTypes(): number[][] | undefined {
    if (this.unknownString === '') {
      return [];
    }

    const records: number[][] = [];
    for (const record of this.unknownString.split(';')) {
      const itemTypes: number[] = [];
      for (const token of record.split(',')) {
        if (!/^-?\d+$/.test(token)) {
          return undefined;
        }
        const itemType = Number(token);
        if (!Number.isSafeInteger(itemType)) {
          return undefined;
        }
        itemTypes.push(itemType);
      }
      records.push(itemTypes);
    }
    return records;
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
    this.unknownBool = reader.readBoolean();
    this.unknownString = reader.readString();
    this.unknownString2 = reader.readString();
    this.errorMessage = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
    writer.writeBoolean(this.unknownBool);
    writer.writeString(this.unknownString);
    writer.writeString(this.unknownString2);
    writer.writeString(this.errorMessage);
  }
}
