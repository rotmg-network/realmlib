import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
/**
 * Sent to cancel the current active trade.
 */
export declare class CancelTradePacket implements Packet {
    readonly type = PacketType.CANCELTRADE;
    write(): void;
    read(): void;
}
