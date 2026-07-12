import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 233 (server -> client), sent in response to
 * `ClaimAccountLevelRewardPacket`. The body is a success flag, compressed
 * account level, and a descriptor string such as
 * `boost_exp:3`, `item:Beginner Weapon`, `char_start_with:all:1:T1`,
 * `fame:200`.
 */
export class ClaimAccountLevelRewardResultPacket implements Packet {

  readonly type = PacketType.CLAIM_ACCOUNT_LEVEL_REWARD_RESULT;

  //#region packet-specific members
  /** If the reward claim was successful. */
  success: boolean;
  /** The sequence id (matches the int32 sent in packet 232). */
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
    this.grantedRewardDescription = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeCompressedInt(this.rewardId);
    writer.writeString(this.grantedRewardDescription);
  }

}
