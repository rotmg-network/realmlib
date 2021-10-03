import { TradeResult } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when the active trade has completed, regardless of whether
 * it was accepted or cancelled
 */
export declare class TradeDonePacket implements Packet {
    readonly type = PacketType.TRADEDONE;
    /**
     * The result of the trade
     */
    code: TradeResult;
    /**
     * > Unknown
     */
    description: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
