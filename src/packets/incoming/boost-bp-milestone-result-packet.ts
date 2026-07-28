import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to `BOOST_BP_MILESTONE` (151). Layout from the
 * 6.12.0.2.0 client binary (class `LAKCDPFFEKK`, incoming factory id 152):
 * a single result bool. Its handler lives in `BattlePassManager` with the
 * strings "Season.MilestoneBoostError(Description)". No wire capture exists
 * yet.
 */
export class BoostBpMilestoneResultPacket implements Packet {
  readonly type = PacketType.BOOST_BP_MILESTONE_RESULT;

  //#region packet-specific members
  /** Whether the milestone boost succeeded. */
  result: boolean;
  //#endregion

  constructor() {
    this.result = false;
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
  }
}
