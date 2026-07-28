import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to unlock a mission tree. A single int32 board/tree id.
 *
 * Formerly `Unknown224Packet`. Two independent sources name it:
 * - the 6.12.0.2.0 client binary: class `KFLPDMILKEJ` (vtable id 224) carries
 *   exactly the `boardId` field token of `ClaimMissionPacket` /
 *   `UnlockMissionPacket`, and the catalog pairs `UnlockMissionTree` with
 *   `UnlockMission` (225);
 * - the original capture: the observed body was 51, and the same session's
 *   `/missions/getPlayerMissions` returned `<TreesUnlocked>50,51</TreesUnlocked>`
 *   — i.e. the packet unlocked tree 51. The effect-18 notification echoing
 *   the value is the "tree unlocked" toast.
 */
export class UnlockMissionTreePacket implements Packet {

  readonly type = PacketType.UNLOCK_MISSION_TREE;

  //#region packet-specific members
  /** Mission board / season tree id (observed 51 = the season tree). */
  boardId: number;
  //#endregion

  constructor() {
    this.boardId = 0;
  }

  /**
   * Backward-compatible alias for {@link UnlockMissionTreePacket.boardId}.
   * @deprecated The int32 is the mission board/tree id.
   */
  get unknownInt(): number {
    return this.boardId;
  }

  set unknownInt(value: number) {
    this.boardId = value;
  }

  read(reader: Reader): void {
    this.boardId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.boardId);
  }
}

/** @deprecated Renamed {@link UnlockMissionTreePacket}. */
export const Unknown224Packet = UnlockMissionTreePacket;
/** @deprecated Renamed {@link UnlockMissionTreePacket}. */
export type Unknown224Packet = UnlockMissionTreePacket;
