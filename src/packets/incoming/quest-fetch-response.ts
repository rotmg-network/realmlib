import { QuestData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to tell the player about new quests
 */
export class QuestFetchResponsePacket implements Packet {

  readonly type = PacketType.QUEST_FETCH_RESPONSE;

  /**
   * The quests which were fetched
   */
  quests: QuestData[];
  /**
   * The cost in gold of the next quest refresh
   */
  nextRefreshPrice: number;

  constructor() {
    this.quests = [];
    this.nextRefreshPrice = 0;
  }

  read(reader: Reader): void {
    const questsLen = reader.readShort();
    this.quests = new Array<QuestData>(questsLen);
    for (let i = 0; i < questsLen; i++) {
      this.quests[i] = new QuestData();
      this.quests[i].read(reader);
    }
    this.nextRefreshPrice = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeShort(this.quests.length);
    for (const quest of this.quests) {
      quest.write(writer);
    }
    writer.writeShort(this.nextRefreshPrice);
  }

  toString(): string {
    let str = `[QuestFetchResponse] Quest Count: ${this.quests.length}\n
    NextRefreshPrice: ${this.nextRefreshPrice}`
    for (let i = 0; i < this.quests.length; i++) {
      if (i == 0) {
        str += `\n${this.quests[i].toString()}\n`
      } else {
        str += `${this.quests[i].toString()}\n`
      }
    }
    return str;
  }
}
