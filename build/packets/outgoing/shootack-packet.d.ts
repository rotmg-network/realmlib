import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to acknowledge an `EnemyShootPacket`.
 */
export declare class ShootAckPacket implements Packet {
    type: PacketType;
    /**
     * The current client time.
     */
    time: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
