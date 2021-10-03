import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to buy an item.
 */
export declare class BuyPacket implements Packet {
    type: PacketType;
    /**
     * The object id of the item being purchased.
     */
    objectId: number;
    /**
     * The number of items being purchased.
     */
    quantity: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
