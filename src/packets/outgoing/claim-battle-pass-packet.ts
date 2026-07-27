import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to claim a battle-pass milestone.
 *
 * Wire format pinned by the 2026-07-27 proxy capture (19 bytes):
 * a UTF pass id (a Datastore id such as "4769974225240064") followed by a
 * single **signed** tier byte. Captured values are 2 and -1 (`ff`); -1 is a
 * sentinel, most plausibly "claim everything available" (that body drew a single
 * `01` reply). The server answers with CLAIM_BP_MILESTONE_RESULT (150, bool);
 * the granted items themselves arrive via the separate CLAIM_REWARD (234) /
 * CLAIM_REWARD_RESULT (235) exchange.
 */
export class ClaimBattlePassPacket implements Packet {

  readonly type = PacketType.CLAIM_BATTLE_PASS;

  //#region packet-specific members
  /** Datastore id of the battle pass being claimed. */
  passId: string;
  /** Signed milestone/track byte; observed 2, or -1 to claim everything available. */
  tier: number;
  //#endregion

  constructor() {
    this.passId = '';
    this.tier = 0;
  }

  write(writer: Writer): void {
    writer.writeString(this.passId);
    writer.writeByte(this.tier);
  }

  read(reader: Reader): void {
    this.passId = reader.readString();
    this.tier = reader.readByte();
  }
}
