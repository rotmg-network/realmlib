import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Buys enchantment dust with gold in the Enchanter UI. The body is a single
 * `"tier:quantity"` string.
 *
 * Confirmed from a capture, watching the player's stats across this packet:
 * body `"4:7"` → gold `250 → 222` (−28) and tier-4 dust `73 → 80` (+7). I.e.
 * buy 7 units of tier-4 dust for 28 gold. The server replies with a
 * `BuyDustsResultPacket` (id 192, success byte), after
 * which the player has enough dust for the next `RerollAllEnchantmentsPacket`.
 * (Dust is carried in `DUST_AMOUNT_STAT` (127) as a `"tier:amount,..."`
 * string.)
 *
 * The recovered current-client class name is `BuyDusts`.
 */
export class BuyDustsPacket implements Packet {
  readonly type = PacketType.BUY_DUSTS;

  //#region packet-specific members
  /**
   * The dust purchase as a `"tier:quantity"` string, e.g. `"4:7"` = 7 units of
   * tier-4 dust. Matches the tiers in `DUST_AMOUNT_STAT` (127).
   */
  value: string;
  //#endregion

  constructor() {
    this.value = '';
  }

  read(reader: Reader): void {
    this.value = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.value);
  }
}
