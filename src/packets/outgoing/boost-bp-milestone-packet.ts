import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to boost/skip a battle-pass milestone. Layout from the 6.12.0.2.0
 * client binary (vtable id 151, catalog `BoostBPMilestoneMessage`): a UTF
 * pass id and a milestone byte — the same shape as `ClaimBattlePassPacket`
 * (149), whose class shares the identical pass-id field token. The server
 * answers with `BOOST_BP_MILESTONE_RESULT` (152). No wire capture exists yet.
 */
export class BoostBpMilestonePacket implements Packet {
  readonly type = PacketType.BOOST_BP_MILESTONE;

  //#region packet-specific members
  /** Datastore id of the battle pass. */
  passId: string;
  /** Milestone byte, mirroring `ClaimBattlePassPacket.tier`. */
  milestone: number;
  //#endregion

  constructor() {
    this.passId = '';
    this.milestone = 0;
  }

  read(reader: Reader): void {
    this.passId = reader.readString();
    this.milestone = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeString(this.passId);
    writer.writeByte(this.milestone);
  }
}
