import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent when the client's position in the queue should be cancelled.
 */
export class QueueCancelPacket implements Packet {
  readonly type = PacketType.QUEUE_CANCEL;

  //#region packet-specific members
  /**
   * The guild whose queue is being cancelled (RealmShark: `guild`).
   */
  guild: string;
  //#endregion

  constructor() {
    this.guild = '';
  }

  read(reader: Reader): void {
    this.guild = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.guild);
  }

  toString(): string {
    return `[QueueCancel] guild: "${this.guild}"`;
  }
}
