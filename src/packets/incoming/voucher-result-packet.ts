import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `RedeemVoucherPacket`. The body is a leading byte
 * (likely a success flag; `0` when the code is invalid), followed by a
 * result/status key string (e.g. `Vouchers.VoucherNotExist`) and the code that
 * was submitted.
 */
export class VoucherResultPacket implements Packet {

  readonly type = PacketType.VOUCHER_RESULT;

  //#region packet-specific members
  /**
   * Whether the voucher was redeemed successfully (observed as `false` for an
   * invalid code; not yet confirmed).
   */
  success: boolean;
  /**
   * The result/status key returned by the server.
   */
  result: string;
  /**
   * The voucher code that was submitted.
   */
  code: string;
  //#endregion

  constructor() {
    this.success = false;
    this.result = '';
    this.code = '';
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.result = reader.readString();
    this.code = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeString(this.result);
    writer.writeString(this.code);
  }
}
