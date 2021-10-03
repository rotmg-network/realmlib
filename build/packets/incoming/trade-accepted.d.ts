import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when the active trade is accepted
 */
export declare class TradeAcceptedPacket implements Packet {
    readonly type = PacketType.TRADEACCEPTED;
    /**
     * A description of which items in the client's inventory are selected.
     * Items 0-3 are the hotbar items, and 4-12 are the 8 inventory slots.
     *
     * If a value is `true`, then the item is selected
     */
    clientOffer: boolean[];
    /**
     * A description of which items in the trade partner's inventory are selected.
     * Items 0-3 are the hotbar items, and 4-12 are the 8 inventory slots.
     *
     * If a value is `true`, then the item is selected
     */
    partnerOffer: boolean[];
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
