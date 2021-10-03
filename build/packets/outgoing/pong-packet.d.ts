import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to acknowledge the `PingPacket.`
 */
export declare class PongPacket implements Packet {
    readonly type = PacketType.PONG;
    /**
     * The serial value received in the `PingPacket` which this acknowledges.
     */
    serial: number;
    /**
     * The current client time.
     */
    time: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
