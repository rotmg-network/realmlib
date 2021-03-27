import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to tell the player the object id of their current quest
 */
export class QuestObjectIdPacket implements Packet {

  readonly type = PacketType.QUESTOBJID;

  /**
   * The object id of the current quest
   */
  objectId: number;

  constructor() {
    this.objectId = 0;
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectId);
  }

  toString(): string {
    return `[QuestObjectId] ObjectId: ${this.objectId}`;
  }
}
