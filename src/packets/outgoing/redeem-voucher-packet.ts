import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to redeem a voucher/promo code. The body is a single string — the code
 * the player entered. The server replies with a `VoucherResultPacket`.
 *
 * (Name inferred from the paired response, which carries strings such as
 * `Vouchers.VoucherNotExist`.)
 */
export class RedeemVoucherPacket implements Packet {

  readonly type = PacketType.REDEEM_VOUCHER;

  //#region packet-specific members
  /**
   * The voucher/promo code being redeemed.
   */
  code: string;
  //#endregion

  constructor() {
    this.code = '';
  }

  read(reader: Reader): void {
    this.code = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.code);
  }
}
