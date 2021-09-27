import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Presumably received when the player needs moderation.
 */
export class ModeratorActionMessage implements Packet {

  readonly type = PacketType.MODERATOR_ACTION_MESSAGE;

  //#region packet-specific members
  /**
   * The moderation message.
   */
  message: string;
  //#endregion

  constructor() {
    this.message = ''
  }

  write(writer: Writer): void {
    writer.writeString(this.message);
  }

  read(reader: Reader): void {
    this.message = reader.readString()
  }
}
