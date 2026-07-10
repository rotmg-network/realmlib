import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to request the contents of a claimable-rewards prompt. The server
 * responds with a `ClaimRewardsInfoPromptPacket` (id 170) whose `promptId`
 * echoes the one sent here — confirmed 4/4 in captures, with the response
 * arriving within one server RTT.
 *
 * Observed prompt ids can coincide with item ids sitting in the gift chest
 * (e.g. 42345 was both a requested prompt id and a gift-chest item), so the
 * id likely identifies a claimable package/container item.
 */
export class ClaimRewardsInfoRequestPacket implements Packet {

  readonly type = PacketType.CLAIM_REWARDS_INFO_REQUEST;

  //#region packet-specific members
  /** The prompt id being requested (echoed back in packet 170). */
  promptId: number;
  //#endregion

  constructor() {
    this.promptId = 0;
  }

  read(reader: Reader): void {
    this.promptId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.promptId);
  }
}
