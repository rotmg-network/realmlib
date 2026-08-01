import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received (server -> client) in response to a {@link ClaimMissionPacket}
 * (`CLAIM_MISSION`, id 163) — captured arriving immediately after the client
 * claimed a mission.
 *
 * The client-binary layout is `byte + bool + string`; the captured body
 * `01 01 0000` parses as byte 1, true, and an empty string (`0000` is the
 * string's zero length prefix — the earlier `short` reading consumed the same
 * bytes but would break on any non-empty message). Both leading bytes are 1 in
 * the only capture, so which is the slot echo and which the success flag is
 * inferred, not proven: the byte is read as the request's `slot` echo and the
 * bool as success, matching this build's result-packet conventions.
 */
export class ClaimMissionResultPacket implements Packet {
  readonly type = PacketType.CLAIM_MISSION_RESULT;

  //#region packet-specific members
  /** Byte echoing the request's `slot` (observed 1), not the mission id. */
  slot: number;
  /** Success flag (observed true). */
  success: boolean;
  /** Message payload; empty in the capture. */
  message: string;
  //#endregion

  constructor() {
    this.slot = 0;
    this.success = false;
    this.message = '';
  }

  read(reader: Reader): void {
    this.slot = reader.readUnsignedByte();
    this.success = reader.readBoolean();
    this.message = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.slot);
    writer.writeBoolean(this.success);
    writer.writeString(this.message);
  }
}
