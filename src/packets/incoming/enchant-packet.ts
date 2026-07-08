import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to an enchantment action (e.g. a
 * `RerollAllEnchantmentsPacket`), typically followed by a `VAULT_CONTENT`
 * refresh. The body is a single byte, observed as `1` — likely a success
 * flag.
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
