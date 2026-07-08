import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to buy an emote. The body is a single int32 — the object type of the
 * emote being bought (observed as 5170).
 */
export class BuyEmotePacket implements Packet {

  readonly type = PacketType.BUY_EMOTE;

  //#region packet-specific members
  /**
   * The object type of the emote being bought.
   */
  emoteType: number;
  //#endregion

  constructor() {
    this.emoteType = 0;
  }

  read(reader: Reader): void {
    this.emoteType = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.emoteType);
  }
}
