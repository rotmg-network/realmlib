import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when the client connects to a server with a queue.
 */
export class QueueInfoPacket implements Packet {
    readonly type = PacketType.QUEUE_INFORMATION;

    /**
     * The current position of the client in the queue
     */
    currentPosition: number;

    /**
     * The maximum amount of clients allowed in the queue
     */
    maxPosition: number;

    constructor()
    {
        this.currentPosition = 0;
        this.maxPosition = 0;
    }

    read(reader: Reader): void {
        this.currentPosition = reader.readUnsignedShort();
        this.maxPosition = reader.readUnsignedShort();
    }

    write(writer: Writer): void {
        writer.writeUnsignedShort(this.currentPosition);
        writer.writeUnsignedShort(this.maxPosition)
    }
}
