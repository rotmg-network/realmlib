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
  /**
   * Additional quest object ids (RealmShark: `list`).
   */
  list: number[];

  constructor() {
    this.objectId = 0;
    this.list = [];
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
    const listLen = reader.readCompressedInt();
    this.list = new Array<number>(listLen);
    for (let i = 0; i < listLen; i++) {
      this.list[i] = reader.readCompressedInt();
    }
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectId);
    writer.writeCompressedInt(this.list.length);
    for (const id of this.list) {
      writer.writeCompressedInt(id);
    }
  }

  toString(): string {
    return `[QuestObjectId] ObjectId: ${this.objectId}, list: [${this.list.join(', ')}]`;
  }
}
