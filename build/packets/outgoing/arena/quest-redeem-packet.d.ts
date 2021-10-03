import { SlotObjectData } from '../../../data/slot-object-data';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * > Unknown.
 */
export declare class QuestRedeemPacket implements Packet {
    readonly type = PacketType.QUEST_REDEEM;
    propagate: boolean;
    /**
     * > Unknown.
     */
    questId: string;
    /**
     * > Unknown.
     */
    slots: SlotObjectData[];
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
