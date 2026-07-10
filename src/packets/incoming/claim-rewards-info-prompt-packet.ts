import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to describe a set of claimable rewards, in response to the
 * client's `ClaimRewardsInfoRequestPacket` (id 239). The body is an int32
 * prompt id, a single byte, then a short-length-prefixed array of int32
 * reward/item ids.
 *
 * The request/response pairing is confirmed: in captures every prompt echoed
 * the id the client had just requested (4/4, one RTT apart). Observed prompt
 * ids can coincide with item ids in the gift chest (42345 was both), so the
 * id likely names a claimable package item and `items` its contents.
 */
export class ClaimRewardsInfoPromptPacket implements Packet {

  readonly type = PacketType.CLAIM_REWARDS_INFO_PROMPT;

  //#region packet-specific members
  /** The prompt id (echoes the `ClaimRewardsInfoRequestPacket`'s value). */
  promptId: number;
  /**
   * A byte, observed 2 or 3. With 3 the ids look like item ids (incl. the
   * seasonal token 2991 and gift-chest items); with 2 they are near-
   * sequential (campaign/mission-like). Likely a reward-category discriminator.
   */
  unknownByte: number;
  /** The reward/item ids offered by this prompt. */
  items: number[];
  //#endregion

  constructor() {
    this.promptId = 0;
    this.unknownByte = 0;
    this.items = [];
  }

  read(reader: Reader): void {
    this.promptId = reader.readInt32();
    this.unknownByte = reader.readByte();
    const count = reader.readShort();
    this.items = new Array<number>(count);
    for (let i = 0; i < count; i++) {
      this.items[i] = reader.readInt32();
    }
  }

  write(writer: Writer): void {
    writer.writeInt32(this.promptId);
    writer.writeByte(this.unknownByte);
    writer.writeShort(this.items.length);
    for (const item of this.items) {
      writer.writeInt32(item);
    }
  }
}
