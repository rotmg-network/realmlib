import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received (server -> client) in response to a {@link ClaimMissionPacket}
 * (`CLAIM_MISSION`, id 163) — captured arriving immediately after the client
 * claimed a mission. Sample `01 01 0000`, read as two bytes and a short.
 *
 * The leading byte is a success flag. The second byte echoes the request's
 * `slot`, **not** the mission id — the 2026-07-27 claim sent `slot` 1 and the
 * reply's second byte was 1. The trailing short mirrors the request's `subId`.
 */
export class ClaimMissionResultPacket implements Packet {

  readonly type = PacketType.CLAIM_MISSION_RESULT;

  //#region packet-specific members
  /** Success flag (observed 1). */
  success: number;
  /** Echo of the request's `slot` (observed 1), not the mission id. */
  slot: number;
  /** Echo of the request's `subId` (observed 0). */
  subId: number;
  //#endregion

  constructor() {
    this.success = 0;
    this.slot = 0;
    this.subId = 0;
  }

  read(reader: Reader): void {
    this.success = reader.readByte();
    this.slot = reader.readByte();
    this.subId = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeByte(this.success);
    writer.writeByte(this.slot);
    writer.writeShort(this.subId);
  }
}
