import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to claim a battle-pass milestone.
 *
 * Wire format pinned by the 2026-07-27 proxy capture (19 bytes):
 * a UTF pass id (a Datastore id such as "4769974225240064") followed by a
 * single tier byte (observed 2). The server answers with
 * CLAIM_BP_MILESTONE_RESULT (150, bool); the granted items themselves arrive
 * via the separate CLAIM_REWARD (234) / CLAIM_REWARD_RESULT (235) exchange.
 */
export class ClaimBattlePassPacket implements Packet {

  readonly type = PacketType.CLAIM_BATTLE_PASS;

  //#region packet-specific members
  /** Datastore id of the battle pass being claimed. */
  passId: string;
  /** Milestone/track byte; observed value 2. */
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
