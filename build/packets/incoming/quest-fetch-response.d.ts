import { QuestData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to tell the player about new quests
 */
export declare class QuestFetchResponsePacket implements Packet {
    readonly type = PacketType.QUEST_FETCH_RESPONSE;
    /**
     * The quests which were fetched
     */
    quests: QuestData[];
    /**
     * The cost in gold of the next quest refresh
     */
    nextRefreshPrice: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
