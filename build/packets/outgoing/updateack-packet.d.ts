import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
/**
 * Sent to acknowledge an `UpdatePacket`.
 */
export declare class UpdateAckPacket implements Packet {
    readonly type = PacketType.UPDATEACK;
    write(): void;
    read(): void;
}
