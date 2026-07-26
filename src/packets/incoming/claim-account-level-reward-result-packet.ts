import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 233 (server -> client), sent in response to
 * `ClaimAccountLevelRewardPacket`. The body is a success flag, a compressed
 * reward ID, and -- ONLY when the claim succeeded -- a descriptor string such
 * as `boost_loot:2`, `boost_exp:3`, `item:Beginner Weapon`,
 * `char_start_with:all:1:T1`, `fame:200`.
 *
 * Confirmed against the 2026-07-26 proxy capture: the one successful sample
 * was `01 1e 000c "boost_loot:2"`, while all 106 failures were the bare
 * two-byte form `00 1e` / `00 1d`.
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

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.rewardId = reader.readCompressedInt();
    // The descriptor is only written when the claim SUCCEEDED. A failed claim
    // (e.g. the reward was already taken) is just the two bytes
    // `<success=0><compressed level>` -- reading the string unconditionally
    // threw on 106 of the 107 samples in the 2026-07-26 proxy capture.
    this.grantedRewardDescription =
      this.success && reader.remaining >= 2 ? reader.readString() : '';
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeCompressedInt(this.rewardId);
    if (this.success) {
      writer.writeString(this.grantedRewardDescription);
    }
  }

}
