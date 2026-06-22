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
  /** The type of moderator action requested (enum ordinal). */
  // todo: add action code types
  actionCode: number;
  /** The message associated with the action. */
  actionMessage: string;
  //#endregion

  constructor() {
    this.actionCode = 0;
    this.actionMessage = '';
  }

  write(writer: Writer): void {
    writer.writeInt32(this.actionCode);
    writer.writeString(this.actionMessage);
  }

  read(reader: Reader): void {
    this.actionCode = reader.readInt32();
    this.actionMessage = reader.readString();
  }
}
