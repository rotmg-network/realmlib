import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Claims one account-level reward. The server replies with a
 * `ClaimAccountLevelRewardResultPacket` carrying the same reward ID and a
 * description of the grants applied to the account.
 */
export class ClaimAccountLevelRewardPacket implements Packet {

  readonly type = PacketType.CLAIM_ACCOUNT_LEVEL_REWARD;

  //#region packet-specific members
  /**
   * Comma-separated selected choice positions. Empty positions are meaningful;
   * captured values include `,1` and `1,,` as well as `1`, `1,2`, and `1,2,3`.
   */
  selectedChoiceSlots: string;
  /** Account-level reward ID (equal to the level in current reward config). */
  rewardId: number;
  //#endregion

  constructor() {
    this.selectedChoiceSlots = '';
    this.rewardId = 0;
  }

  read(reader: Reader): void {
    this.selectedChoiceSlots = reader.readString();
    this.rewardId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeString(this.selectedChoiceSlots);
    writer.writeInt32(this.rewardId);
  }

}
