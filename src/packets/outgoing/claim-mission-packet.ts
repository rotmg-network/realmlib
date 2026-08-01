import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to claim a mission reward.
 *
 * The four fields were `unknown*` when this was inferred from a single sample,
 * but two independent 2026-07-27 sources now resolve them:
 *
 * ```
 * C->S 163: 00000032 00000003 01 ffff
 * ```
 *
 * `/missions/getPlayerMissions` for the same account returns
 * `<TreesUnlocked>50,51</TreesUnlocked>` and, inside `<Season id="50">`, the
 * entry `3,4,1,1783451287,0,0`. So `boardId` 50 is the season mission tree and
 * `missionId` 3 is that season entry. `slot` is independent of `missionId` (the
 * earlier sample set happened to move them in lockstep, which is why it could
 * not be told apart before).
 *
 * The season entry format, for reference, is
 * `id, progress, state, startedTimestamp, claimed, claimedTimestamp`, where
 * `state` is 0 = active, 1 = complete/claimable, 2 = claimed. Mission 3 here was
 * "Scouting the Unknown" at progress 4 (complete), i.e. the reward popup.
 */
export class ClaimMissionPacket implements Packet {
  readonly type = PacketType.CLAIM_MISSION;

  //#region packet-specific members
  /** Mission board / season tree id (observed 50, the season mission tree). */
  boardId: number;
  /** Mission id within the board (observed 3, matching the season entry). */
  missionId: number;
  /** Unsigned slot index of the claim; independent of `missionId` (observed 1). */
  slot: number;
  /** Unsigned sub-id, exposed as -1 for the wire sentinel `0xffff`. */
  subId: number;
  //#endregion

  constructor() {
    this.boardId = 0;
    this.missionId = 0;
    this.slot = 0;
    this.subId = -1;
  }

  read(reader: Reader): void {
    this.boardId = reader.readInt32();
    this.missionId = reader.readInt32();
    this.slot = reader.readUnsignedByte();
    const subId = reader.readUnsignedShort();
    this.subId = subId === 0xffff ? -1 : subId;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.boardId);
    writer.writeInt32(this.missionId);
    writer.writeUnsignedByte(this.slot);
    writer.writeUnsignedShort(this.subId === -1 ? 0xffff : this.subId);
  }
}
