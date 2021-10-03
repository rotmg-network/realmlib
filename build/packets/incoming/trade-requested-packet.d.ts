import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when a trade is requested.
 */
export declare class TradeRequestedPacket implements Packet {
    readonly type = PacketType.TRADEREQUESTED;
    /**
     * The name of the player who requested the trade.
     */
    name: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
