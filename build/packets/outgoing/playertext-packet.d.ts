import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent when the client sends a chat message.
 */
export declare class PlayerTextPacket implements Packet {
    readonly type = PacketType.PLAYERTEXT;
    /**
     * The message to send.
     */
    text: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
