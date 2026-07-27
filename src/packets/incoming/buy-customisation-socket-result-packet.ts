import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received (server -> client) in response to a `BUY_CUSTOMISATION_SOCKET` (140).
 *
 * Packet id 141 is a new id: it is not in the Exalt embedded catalog mapping,
 * only in the 2026-07-27 capture, where it followed every 140 with the body
 * `01 0000` three times out of three. Modelled as `byte success + short code`,
 * the shape every other result packet in this build uses.
 */
export class BuyCustomisationSocketResultPacket implements Packet {

  readonly type = PacketType.BUY_CUSTOMISATION_SOCKET_RESULT;

  //#region packet-specific members
  /** Success flag (observed 1). */
  success: number;
  /** Result/status code (observed 0). */
  code: number;
  //#endregion

  constructor() {
    this.success = 0;
    this.code = 0;
  }

  read(reader: Reader): void {
    this.success = reader.readByte();
    this.code = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeByte(this.success);
    writer.writeShort(this.code);
  }
}
