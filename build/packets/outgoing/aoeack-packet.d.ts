import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to acknowledge an `AoePacket`.
 */
export declare class AoeAckPacket implements Packet {
    readonly type = PacketType.AOEACK;
    /**
     * The current client time.
     */
    time: number;
    /**
     * The position of the AoE which this packet is acknowledging.
     */
    position: WorldPosData;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
