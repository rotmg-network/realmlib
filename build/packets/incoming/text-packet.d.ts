import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when a chat message is sent by another player or NPC
 */
export declare class TextPacket implements Packet {
    readonly type = PacketType.TEXT;
    /**
     * The sender of the message
     */
    name: string;
    /**
     * The object id of the sender
     */
    objectId: number;
    /**
     * The number of stars of the sender
     */
    numStars: number;
    /**
     * The length of time to display the chat bubble for
     */
    bubbleTime: number;
    /**
     * The recipient of the message
     */
    recipient: string;
    /**
     * The content of the message
     */
    text: string;
    /**
     * > Unknown.
     */
    cleanText: string;
    /**
     * Whether or not the sender of the message is a supporter
     */
    isSupporter: boolean;
    /**
     * The star background of the player
     */
    starBackground: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
