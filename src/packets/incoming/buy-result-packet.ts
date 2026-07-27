import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `BuyPacket`.
 */
export class BuyResultPacket implements Packet {

  readonly type = PacketType.BUYRESULT;

  //#region packet-specific members
  /**
   * The result code.
   */
  result: number;
  /**
   * Server response payload. Successful purchases commonly return JSON such
   * as `{"k":"s.buy_success"}`; failures may instead contain plain text.
   */
  resultString: string;
  //#endregion

  constructor() {
    this.result = 0;
    this.resultString = '';
  }

  read(reader: Reader): void {
    this.result = reader.readInt32();
    this.resultString = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.result);
    writer.writeString(this.resultString);
  }

  /**
   * Parses a JSON result payload, returning `undefined` for plain-text or
   * malformed responses.
   */
  parseJson(): unknown | undefined {
    try {
      return JSON.parse(this.resultString);
    } catch {
      return undefined;
    }
  }
}
