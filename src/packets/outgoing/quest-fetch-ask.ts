import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';

/**
 * Sent to request the latest quests.
 */
export class QuestFetchAskPacket implements Packet {

  readonly type = PacketType.QUEST_FETCH_ASK;

  

  write(): void {
    //
  }

  read(): void {
    //
  }
}
