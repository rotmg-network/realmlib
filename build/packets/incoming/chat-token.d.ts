import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
/**
 * Received when the server sends the client a chat token to use (unnused)
 */
export declare class ChatToken implements Packet {
    readonly type = PacketType.CHATTOKEN;
    /**
     * The chat token for the current client
     */
    token: string;
    /**
     * The host address of the chat server
     */
    host: string;
    /**
     * The port of the chat server
     */
    port: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
