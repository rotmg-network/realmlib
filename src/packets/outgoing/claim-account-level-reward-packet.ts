import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 232 (client -> server). Observed as a string followed
 * by an int32 that increments across a burst (a request/sequence id); the
 * server replies per entry with a `ClaimAccountLevelRewardResultPacket` carrying a reward
 * descriptor string. Appears to walk a redeemable-reward catalogue.
 */
export class ClaimAccountLevelRewardPacket implements Packet {

  readonly type = PacketType.CLAIM_ACCOUNT_LEVEL_REWARD;

  //#region packet-specific members
  /** A short string payload (observed values like "1", "1,", "1,2"). */
  selectedChoiceSlots: string;
  /** An int32 sequence/request id (increments across a burst). */
  accountLevel: number;
  //#endregion

  constructor() {
    this.selectedChoiceSlots = '';
    this.accountLevel = 0;
  }

  read(reader: Reader): void {
    this.selectedChoiceSlots = reader.readString();
    this.accountLevel = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeString(this.selectedChoiceSlots);
    writer.writeInt32(this.accountLevel);
  }

}
