import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to look inside a chest item without opening it. The server responds with
 * a `ClaimRewardsInfoPromptPacket` (id 170) whose `chestItemType` echoes the one
 * sent here — confirmed in every capture, one server RTT apart.
 *
 * The id is simply the chest's own item type, which is why a bare int32 is
 * enough to identify it. This is a read: the 2026-07-27 capture sent it for a
 * chest still sitting in vault storage, took the pool back, and only swapped and
 * used the item much later. Nothing is consumed and no claim need follow.
 */
export class ClaimRewardsInfoRequestPacket implements Packet {
  readonly type = PacketType.CLAIM_REWARDS_INFO_REQUEST;

  //#region packet-specific members
  /** The chest item type being inspected (echoed back in packet 170). */
  chestItemType: number;
  //#endregion

  constructor() {
    this.chestItemType = 0;
  }

  read(reader: Reader): void {
    this.chestItemType = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.chestItemType);
  }
}
