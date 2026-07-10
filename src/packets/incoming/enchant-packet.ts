import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to an enchantment action (e.g. a
 * `RerollAllEnchantmentsPacket`). The body is a single byte, observed as `1` —
 * a success flag.
 *
 * Observed chain (all within the same server tick):
 * `REROLL_ALL_ENCHANTMENTS (C->S)` → `ENCHANT (S->C, success)` →
 * `VAULT_CONTENT (S->C, refresh)`. The client learns the new enchantments
 * from the VAULT_CONTENT that follows, not from this packet.
 */
export class EnchantPacket implements Packet {

  readonly type = PacketType.ENCHANT;

  //#region packet-specific members
  /**
   * Whether the enchantment action succeeded (observed as `true` in all
   * samples; not yet confirmed).
   */
  success: boolean;
  //#endregion

  constructor() {
    this.success = false;
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
  }
}
