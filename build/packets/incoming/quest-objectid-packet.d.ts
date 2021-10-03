import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to tell the player the object id of their current quest
 */
export declare class QuestObjectIdPacket implements Packet {
    readonly type = PacketType.QUESTOBJID;
    /**
     * The object id of the current quest
     */
    objectId: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
