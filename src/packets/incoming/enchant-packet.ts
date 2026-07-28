import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to an enchantment action (e.g. a
 * `RerollAllEnchantmentsPacket`).
 *
 * The 6.12.0.2.0 client binary binds id 190 to `OEKBIJFHBIL :
 * BaseEnchantmentResultMessage`, whose layout is `bool result + string
 * errorText`, and its handler carries the string "Enchantments.RerollError" —
 * i.e. the catalog's `RerollEnchantmentsResultMessage`. Every captured body so
 * far is the single byte `01` with NO string, so the server truncates the
 * error text on success; `errorText` is therefore read only when bytes remain
 * and is `null` when absent, preserving byte-exact round-trips of the
 * captured one-byte body.
 *
 * Observed chain (all within the same server tick):
 * `REROLL_ALL_ENCHANTMENTS (C->S)` → `ENCHANT (S->C, success)` →
 * `NEWTICK (S->C, stat 80 update)`. The client learns the new enchantments
 * from the stat update that follows, not from this packet.
 */
export class EnchantPacket implements Packet {
  readonly type = PacketType.ENCHANT;

  //#region packet-specific members
  /** Whether the enchantment action succeeded. */
  success: boolean;
  /** Error text; omitted on the wire (null) in every success capture. */
  errorText: string | null;
  //#endregion

  constructor() {
    this.success = false;
    this.errorText = null;
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.errorText = reader.remaining > 0 ? reader.readString() : null;
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    if (this.errorText !== null) {
      writer.writeString(this.errorText);
    }
  }
}
