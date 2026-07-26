import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `RedeemVoucherPacket`.
 *
 * Body is a success boolean followed by a run of length-prefixed strings that
 * continues to the end of the packet. The run differs by outcome:
 *
 *   failure: `['Vouchers.VoucherNotExist', '<submitted code>']`
 *   success: `['', 'ROTMG NEOALIEN', "Calbrik's Reckoning - Free Gift",
 *              '4711,4967,3177,5094,...', '']`
 *
 * Both branches were observed in the 2026-07-26 capture and both are consumed
 * exactly by this layout.
 */
export class VoucherResultPacket implements Packet {

  readonly type = PacketType.VOUCHER_RESULT;

  //#region packet-specific members
  /** Whether the voucher was redeemed successfully. */
  success: boolean;
  /** Every string in the packet, in wire order. */
  strings: string[];
  //#endregion

  /** Localisation key / failure reason, or `''` when the redeem succeeded. */
  get resultKey(): string {
    return !this.success ? this.strings[0] ?? '' : '';
  }

  /** Display name of the redeemed voucher, or `''` on failure. */
  get voucherName(): string {
    return this.success ? this.strings[1] ?? '' : '';
  }

  /** Description of what the voucher granted, or `''` on failure. */
  get description(): string {
    return this.success ? this.strings[2] ?? '' : '';
  }

  /** Comma-separated granted item types, or `''` on failure. */
  get grantedItems(): string {
    return this.success ? this.strings[3] ?? '' : '';
  }

  constructor() {
    this.success = false;
    this.strings = [];
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    // The string run differs by outcome, so never assume a fixed count:
    //   failure: ['Vouchers.VoucherNotExist', '<submitted code>']
    //   success: ['', 'ROTMG NEOALIEN', "Calbrik's Reckoning - Free Gift",
    //             '4711,4967,3177,5094,...', '']
    // Reading two fixed strings left 88 bytes unconsumed on the first
    // successful redeem seen (2026-07-26 capture).
    this.strings = [];
    while (reader.remaining >= 2) {
      this.strings.push(reader.readString());
    }
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    for (const value of this.strings) {
      writer.writeString(value);
    }
  }
}
