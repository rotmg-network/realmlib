import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to acknowledge a `GotoPacket`.
 */
export declare class GotoAckPacket implements Packet {
    readonly type = PacketType.GOTOACK;
    /**
     * The current client time.
     */
    time: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
