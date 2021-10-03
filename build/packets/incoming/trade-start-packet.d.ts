import { TradeItem } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when a new active trade has been initiated
 */
export declare class TradeStartPacket implements Packet {
    readonly type = PacketType.TRADESTART;
    /**
     * A description of the player's inventory. Items 0-3 are the hotbar items,
     * and 4-12 are the 8 inventory slots
     */
    clientItems: TradeItem[];
    /**
     * The trade partner's name.
     */
    partnerName: string;
    /**
     * A description of the trade partner's inventory. Items 0-3 are the
     * hotbar items, and 4-12 are the 8 inventory slots
     */
    partnerItems: TradeItem[];
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
