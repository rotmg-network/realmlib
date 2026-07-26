import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to purchase an item from a shop.
 *
 * The body is a single comma-separated string:
 * `<category>,<itemId>,<quantity>,<currency>` — the 2026-07-26 proxy capture
 * carried `Equipment,31597,1,Fame`. The server replies with a `NOTIFICATION`
 * of effect 17 whose XML echoes the same item id along with the resulting
 * Credits/Fame balances.
 *
 * Only one sample has been observed, so the field split is provisional; the
 * packet id and the single-string shape are confirmed.
 */
export class PurchaseRequestPacket implements Packet {

  readonly type = PacketType.PURCHASE_REQUEST;

  //#region packet-specific members
  /** The raw request string, e.g. `Equipment,31597,1,Fame`. */
  request: string;
  //#endregion

  constructor() {
    this.request = '';
  }

  /** Build the request string from its parts. */
  static build(category: string, itemId: number, quantity: number, currency: string): string {
    return `${category},${itemId},${quantity},${currency}`;
  }

  /** The request split into its four comma-separated fields. */
  get parts(): string[] {
    return this.request.split(',');
  }

  read(reader: Reader): void {
    this.request = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.request);
  }
}
