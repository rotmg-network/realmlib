import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to unlock a mission. Layout from the 6.12.0.2.0 client binary (class
 * `MACLFDAPPLP`, vtable id 225): two int32s carrying exactly the same field
 * tokens as `ClaimMissionPacket`'s `boardId`/`missionId` — i.e. the
 * (season tree, mission) pair. Catalog name `UnlockMission`. Its sibling 224
 * (`UnlockMissionTree`) carries just the boardId. No wire capture exists yet.
 */
export class UnlockMissionPacket implements Packet {
  readonly type = PacketType.UNLOCK_MISSION;

  //#region packet-specific members
  /** Mission board / season tree id (token-matched with ClaimMission). */
  boardId: number;
  /** Mission id within the board (token-matched with ClaimMission). */
  missionId: number;
  //#endregion

  constructor() {
    this.boardId = 0;
    this.missionId = 0;
  }

  read(reader: Reader): void {
    this.boardId = reader.readInt32();
    this.missionId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.boardId);
    writer.writeInt32(this.missionId);
  }
}
