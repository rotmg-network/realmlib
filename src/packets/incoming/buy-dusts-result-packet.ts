import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `BuyDustsPacket` (id 191). The body is a single
 * byte, observed as `1` — the
 * purchase-success flag. In captures it arrived ~0.7s after the client's
 * id-191 request, 1:1, immediately before the player's gold/dust stats updated.
 */
export class BuyDustsResultPacket implements Packet {
  readonly type = PacketType.BUY_DUSTS_RESULT;

  //#region packet-specific members
  /** Whether the dust purchase succeeded (observed `true`). */
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
