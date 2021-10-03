import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent when the clients position in the queue should be cancelled
 */
export declare class QueueCancelPacket implements Packet {
    readonly type = PacketType.QUEUE_CANCEL;
    bufferMax: number;
    bufferSize: number;
    byteString: string;
    bytes: number[];
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
