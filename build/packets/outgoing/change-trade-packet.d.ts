import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to change the client's offer in the current active trade.
 */
export declare class ChangeTradePacket implements Packet {
    readonly type = PacketType.CHANGETRADE;
    /**
     * A description of which items in the client's inventory are selected.
     * Items 0-3 are the hotbar items, and 4-12 are the 8 inventory slots.
     *
     * If a value is `true`, then the item is selected.
     */
    offer: boolean[];
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
