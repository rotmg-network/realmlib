import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Result information returned after an exaltation reward redemption request.
 * The current client names this message `ExaltationRedeemInfoMessage`.
 */
export class ExaltationRedeemInfoPacket implements Packet {
  readonly type = PacketType.EXALTATION_REDEEM_INFO;

  //#region packet-specific members
  /** Result flag. */
  result: boolean;
  /** Message payload. */
  message: string;
  //#endregion

  constructor() {
    this.result = false;
    this.message = '';
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
    this.message = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
    writer.writeString(this.message);
  }
}

/** @deprecated Use `ExaltationRedeemInfoPacket`. */
export class Unknown116Packet extends ExaltationRedeemInfoPacket {}
