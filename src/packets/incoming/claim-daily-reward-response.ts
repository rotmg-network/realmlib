import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `ClaimDailyRewardMessage`.
 */
export class ClaimDailyRewardResponse implements Packet {
  readonly type = PacketType.LOGIN_REWARD_MSG;

  //#region packet-specific members
  /** Server response text. This is the only field in the current wire layout. */
  message: string;
  /** @deprecated Not present in the current packet body; retained for source compatibility. */
  itemId: number;
  /** @deprecated Not present in the current packet body; retained for source compatibility. */
  quantity: number;
  /** @deprecated Not present in the current packet body; retained for source compatibility. */
  gold: number;
  //#endregion

  constructor() {
    this.message = '';
    this.itemId = 0;
    this.quantity = 0;
    this.gold = 0;
  }

  read(reader: Reader): void {
    this.message = reader.readString();
    this.itemId = 0;
    this.quantity = 0;
    this.gold = 0;
  }

  write(writer: Writer): void {
    writer.writeString(this.message);
  }
}
