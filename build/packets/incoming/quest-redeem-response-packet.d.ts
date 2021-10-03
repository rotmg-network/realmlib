import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * > Unknown
 */
export declare class QuestRedeemResponsePacket implements Packet {
    readonly type = PacketType.QUEST_REDEEM_RESPONSE;
    /**
     * > Unknown
     */
    ok: boolean;
    /**
     * > Unknown
     */
    message: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
