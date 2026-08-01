import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Competition reward column selected by packet 234. */
export enum ClaimRewardColumn {
  Column0 = 0,
  Column1 = 1,
}

/** @deprecated Packet 234 selects competition columns, not Battle Pass tracks. */
export enum ClaimRewardTrack {
  Free = 0,
  Premium = 1,
}

/**
 * Current build packet 234 (client -> server). The body is a single byte
 * (observed as both 0 and 1); the server replies with a
 * `ClaimRewardResultPacket` carrying an XML reward manifest. Current captures,
 * `/missions/getCompetition`, and handler ownership prove the byte selects one
 * of the competition reward columns. The response does not echo the column.
 */
export class ClaimRewardPacket implements Packet {
  readonly type = PacketType.CLAIM_REWARD;

  //#region packet-specific members
  /** Competition reward column (observed 0 and 1). */
  columnId: number;
  //#endregion

  constructor() {
    this.columnId = 0;
  }

  /** @deprecated Use {@link ClaimRewardPacket.columnId}. */
  get unknownByte(): number {
    return this.columnId;
  }

  set unknownByte(value: number) {
    this.columnId = value;
  }

  /** Typed view of the competition column. */
  get column(): ClaimRewardColumn {
    return this.columnId as ClaimRewardColumn;
  }

  set column(value: ClaimRewardColumn) {
    this.columnId = value;
  }

  /** Typed alias for the captured free/premium track selector. */
  get track(): ClaimRewardTrack {
    return this.columnId as ClaimRewardTrack;
  }

  set track(value: ClaimRewardTrack) {
    this.columnId = value;
  }

  static forColumn(column: ClaimRewardColumn): ClaimRewardPacket {
    const packet = new ClaimRewardPacket();
    packet.column = column;
    return packet;
  }

  /** @deprecated Use {@link ClaimRewardPacket.forColumn}. */
  static forTrack(track: ClaimRewardTrack): ClaimRewardPacket {
    const packet = new ClaimRewardPacket();
    packet.track = track;
    return packet;
  }

  read(reader: Reader): void {
    this.columnId = reader.readUnsignedByte();
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.columnId);
  }
}
