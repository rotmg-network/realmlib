import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Observed raw result codes multiplexed across several purchase operations. */
export enum BuyResultCode {
  UnknownFailure = -1,
  GenericSuccess = 0,
  Unknown2 = 2,
  Unknown3 = 3,
  PetFeedSuccess = 7,
  Unknown10 = 10,
  PetBackpackSuccess = 13,
}

/**
 * Multiplexed purchase/economy result. The originating operation is required
 * to interpret success: code 7 confirms pet feed and code 13 confirms pet
 * backpack expansion, so `result === 0` is not a universal success test.
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

  /** Typed view which preserves unknown numeric server values. */
  get code(): BuyResultCode {
    return this.result as BuyResultCode;
  }

  set code(value: BuyResultCode) {
    this.result = value;
  }

  isPetFeedSuccess(): boolean {
    return this.result === BuyResultCode.PetFeedSuccess;
  }

  isPetBackpackSuccess(): boolean {
    return this.result === BuyResultCode.PetBackpackSuccess;
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
