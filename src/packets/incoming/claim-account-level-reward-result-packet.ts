import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { AccountRewardGrant, parseAccountRewardGrants } from '../../models';

/**
 * Current build packet 233 (server -> client), sent in response to
 * `ClaimAccountLevelRewardPacket`. The body is a success flag, an unsigned-byte
 * reward ID, and -- ONLY when the claim succeeded -- a comma-separated grant
 * descriptor such as `item:Stat Potion Choice Chest,item:Power Pizza` or
 * `fame:1000`. Item grants may include skin/texture data after a second colon.
 *
 * Confirmed by 184 event-deduplicated responses. All 106 failures are the bare
 * two-byte form `<success=0><rewardId>`, including three `00 ff` bodies that a
 * compressed-integer decoder cannot consume.
 */
export class ClaimAccountLevelRewardResultPacket implements Packet {
  readonly type = PacketType.CLAIM_ACCOUNT_LEVEL_REWARD_RESULT;

  //#region packet-specific members
  /** If the reward claim was successful. */
  success: boolean;
  /** Reward ID matching the int32 sent in packet 232. */
  rewardId: number;
  /** A reward/entry descriptor string (e.g. `fame:200`). */
  grantedRewardDescription: string;
  //#endregion

  constructor() {
    this.success = false;
    this.rewardId = 0;
    this.grantedRewardDescription = '';
  }

  /** Parses {@link ClaimAccountLevelRewardResultPacket.grantedRewardDescription} into typed grants. */
  get grants(): AccountRewardGrant[] {
    return parseAccountRewardGrants(this.grantedRewardDescription);
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.rewardId = reader.readUnsignedByte();
    // The descriptor is only written when the claim SUCCEEDED. A failed claim
    // (e.g. the reward was already taken) is just the two bytes
    // `<success=0><rewardId>` -- reading the string unconditionally
    // threw on 106 of the 107 samples in the 2026-07-26 proxy capture.
    this.grantedRewardDescription = this.success ? reader.readString() : '';
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeUnsignedByte(this.rewardId);
    if (this.success) {
      writer.writeString(this.grantedRewardDescription);
    }
  }
}
