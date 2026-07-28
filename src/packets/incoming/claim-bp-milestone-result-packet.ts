import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a CLAIM_BATTLE_PASS (149): a single success bool.
 * Sample (2026-07-27 proxy capture): `01`.
 */
export class ClaimBpMilestoneResultPacket implements Packet {
  readonly type = PacketType.CLAIM_BP_MILESTONE_RESULT;

  //#region packet-specific members
  /** Whether the milestone claim succeeded. */
  success: boolean;
  //#endregion

  constructor() {
    this.success = false;
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
  }
}
