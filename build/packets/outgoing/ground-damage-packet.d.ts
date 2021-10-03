import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent when the client takes damage from a ground source, such as lava.
 */
export declare class GroundDamagePacket implements Packet {
    readonly type = PacketType.GROUNDDAMAGE;
    /**
     * The current client time.
     */
    time: number;
    /**
     * The current client position.
     */
    position: WorldPosData;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
