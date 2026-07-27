import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received (server -> client) in response to a `BUY_CUSTOMISATION_SOCKET` (140).
 *
 * Packet id 141 is a new id: absent from the Exalt embedded catalog and from
 * the client's vtable extraction under any legacy name, but present in both
 * 2026-07-27 sessions, following every 140 with the body `01 0000` (four
 * occurrences). The client-binary layout is `bool + string`; the captured
 * bodies parse as `true` + an empty string (`0000` is the string's zero length
 * prefix, not a short).
 */
export class BuyCustomisationSocketResultPacket implements Packet {

  readonly type = PacketType.BUY_CUSTOMISATION_SOCKET_RESULT;

  //#region packet-specific members
  /** Whether the purchase/application succeeded. */
  success: boolean;
  /** Message payload; empty in every capture so far. */
  message: string;
  //#endregion

  constructor() {
    this.success = false;
    this.message = '';
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.message = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeString(this.message);
  }
}
