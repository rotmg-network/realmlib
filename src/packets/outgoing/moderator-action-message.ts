import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Admin-only packet sent to the server to request a moderator action on a player.
 */
export class ModeratorActionMessagePacket implements Packet {
  readonly type = PacketType.MODERATOR_ACTION_MESSAGE;

  //#region packet-specific members
  /** The unsigned-byte moderator action code. */
  // todo: add action code types
  actionCode: number;
  /** Target player names in the server's raw string representation. */
  playerNames: string;
  /** Reason supplied for the action. */
  reason: string;
  /** Signed duration in days. */
  durationDays: number;
  //#endregion

  constructor() {
    this.actionCode = 0;
    this.playerNames = '';
    this.reason = '';
    this.durationDays = 0;
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.actionCode);
    writer.writeString(this.playerNames);
    writer.writeString(this.reason);
    writer.writeShort(this.durationDays);
  }

  read(reader: Reader): void {
    this.actionCode = reader.readUnsignedByte();
    this.playerNames = reader.readString();
    this.reason = reader.readString();
    this.durationDays = reader.readShort();
  }

  /** @deprecated Use {@link ModeratorActionMessagePacket.reason}. */
  get actionMessage(): string {
    return this.reason;
  }

  set actionMessage(value: string) {
    this.reason = value;
  }
}
