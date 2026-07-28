import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sends a serialized item selection to another account. The current client
 * names the fields `items` and `recipient`; the format inside `items` remains
 * opaque to the packet layer.
 */
export class GiftItemsPacket implements Packet {

  readonly type = PacketType.GIFT_ITEMS;

  //#region packet-specific members
  /** Client-defined serialized item selection. */
  items: string;
  /** Recipient account or player name. */
  recipient: string;
  //#endregion

  constructor() {
    this.items = '';
    this.recipient = '';
  }

  read(reader: Reader): void {
    this.items = reader.readString();
    this.recipient = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.items);
    writer.writeString(this.recipient);
  }

  /** @deprecated Use {@link GiftItemsPacket.items}. */
  get unknownString(): string {
    return this.items;
  }

  set unknownString(value: string) {
    this.items = value;
  }

  /** @deprecated Use {@link GiftItemsPacket.recipient}. */
  get unknownString2(): string {
    return this.recipient;
  }

  set unknownString2(value: string) {
    this.recipient = value;
  }
}

/** @deprecated Use {@link GiftItemsPacket}. */
export const Unknown226Packet = GiftItemsPacket;
/** @deprecated Use {@link GiftItemsPacket}. */
export type Unknown226Packet = GiftItemsPacket;
