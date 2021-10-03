import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
export declare class TradeItem implements DataPacket {
    /**
     * The item id
     */
    item: number;
    /**
     * The slot type the item is stored in
     */
    slotType: number;
    /**
     * Whether or not the item is tradeable
     */
    tradeable: boolean;
    /**
     * Whether or not the item is included in an active trade
     */
    included: boolean;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
