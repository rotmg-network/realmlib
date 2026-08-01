import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `RedeemVoucherPacket`.
 *
 * The error message and echoed voucher code are always present. Successful
 * results append the reward name/items, two numeric rewards, and a battle-pass
 * flag. Failed results end after the echoed code.
 */
export class VoucherResultPacket implements Packet {
  readonly type = PacketType.VOUCHER_RESULT;

  //#region packet-specific members
  /** Whether the voucher was redeemed successfully. */
  success: boolean;
  /** Localisation key / error text; empty for a successful redemption. */
  errorMessage: string;
  /** The submitted voucher code echoed by the server. */
  voucherCode: string;
  /** Display name of the redeemed voucher; success-only. */
  name: string;
  /** Comma-separated item types granted by the voucher; success-only. */
  rewardItems: string;
  /** Gold granted by the voucher; success-only. */
  gold: number;
  /** Battle-pass discount granted by the voucher; success-only. */
  battlePassDiscount: number;
  /** Whether the voucher grants a battle pass; success-only. */
  battlePass: boolean;
  //#endregion

  /** @deprecated Use {@link VoucherResultPacket.errorMessage}. */
  get resultKey(): string {
    return !this.success ? this.errorMessage : '';
  }

  /** @deprecated Use {@link VoucherResultPacket.name}. */
  get voucherName(): string {
    return this.success ? this.name : '';
  }

  /** @deprecated The current packet has no separate description; use {@link VoucherResultPacket.name}. */
  get description(): string {
    return this.success ? this.name : '';
  }

  /** @deprecated Use {@link VoucherResultPacket.rewardItems}. */
  get grantedItems(): string {
    return this.success ? this.rewardItems : '';
  }

  /**
   * String-only compatibility view in wire order.
   * @deprecated Use the typed fields instead.
   */
  get strings(): string[] {
    const strings = [this.errorMessage, this.voucherCode];
    if (this.success) {
      strings.push(this.name, this.rewardItems);
    }
    return strings;
  }

  set strings(strings: string[]) {
    this.errorMessage = strings[0] ?? '';
    this.voucherCode = strings[1] ?? '';
    this.name = this.success ? (strings[2] ?? '') : '';
    this.rewardItems = this.success ? (strings[3] ?? '') : '';
  }

  constructor() {
    this.success = false;
    this.errorMessage = '';
    this.voucherCode = '';
    this.name = '';
    this.rewardItems = '';
    this.gold = 0;
    this.battlePassDiscount = 0;
    this.battlePass = false;
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.errorMessage = reader.readString();
    this.voucherCode = reader.readString();

    this.name = '';
    this.rewardItems = '';
    this.gold = 0;
    this.battlePassDiscount = 0;
    this.battlePass = false;
    if (this.success) {
      this.name = reader.readString();
      this.rewardItems = reader.readString();
      this.gold = reader.readInt32();
      this.battlePassDiscount = reader.readInt32();
      this.battlePass = reader.readBoolean();
    }
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeString(this.errorMessage);
    writer.writeString(this.voucherCode);
    if (this.success) {
      writer.writeString(this.name);
      writer.writeString(this.rewardItems);
      writer.writeInt32(this.gold);
      writer.writeInt32(this.battlePassDiscount);
      writer.writeBoolean(this.battlePass);
    }
  }
}
