import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to initiate the chat stream (unnused)
 */
export declare class ChatHelloPacket implements Packet {
    readonly type = PacketType.CHATHELLO;
    /**
     * The clients account ID
     */
    accountId: string;
    /**
     * The chat initiation token
     */
    token: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
    toString(): string;
}
