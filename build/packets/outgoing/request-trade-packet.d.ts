import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to request a trade with a player, as well as
 * to accept a pending trade with a player.
 */
export declare class RequestTradePacket implements Packet {
    readonly type = PacketType.REQUESTTRADE;
    /**
     * The name of the player to request the trade with.
     */
    name: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
