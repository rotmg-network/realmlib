import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when a notification is received by the player
 */
export declare class NotificationPacket implements Packet {
    readonly type = PacketType.NOTIFICATION;
    /**
     * The object id of the entity which the notification is for.
     */
    objectId: number;
    /**
     * The notification message
     */
    message: string;
    /**
     * The color of the notification text
     */
    color: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
