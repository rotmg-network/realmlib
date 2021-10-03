import { DataPacket } from '../packet';
import { Reader } from '../reader';
import { Writer } from '../writer';
/**
 * Information about a quest, such as a daily quest.
 */
export declare class QuestData implements DataPacket {
    /**
     * The id of this quest
     */
    id: string;
    /**
     * The name of this quest
     */
    name: string;
    /**
     * The description of this quest
     */
    description: string;
    /**
     * The expiration time of this quest
     */
    expiration: string;
    /**
     * The list of item IDs which are required to complete this quest
     */
    requirements: number[];
    /**
     * The list of item IDs which are awarded upon completion of this quest
     */
    rewards: number[];
    /**
     * Whether or not this quest has been completed
     */
    completed: boolean;
    /**
     * > Unknown
     */
    itemOfChoice: boolean;
    /**
     * Whether or not the quest is repeatable
     */
    repeatable: boolean;
    /**
     * The category of this quest
     */
    category: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
