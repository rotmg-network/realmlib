import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when a global notification is sent out to all players.
 */
export declare class GlobalNotificationPacket implements Packet {
    readonly type = PacketType.GLOBAL_NOTIFICATION;
    /**
     * The type of notification received.
     */
    notificationType: number;
    /**
     * The notification message.
     */
    text: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
