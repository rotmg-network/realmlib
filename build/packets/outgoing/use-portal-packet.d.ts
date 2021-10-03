import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to prompt the server to send a `ReconnectPacket` which
 * contains the reconnect information for the used portal.
 */
export declare class UsePortalPacket implements Packet {
    readonly type = PacketType.USEPORTAL;
    /**
     * The object id of the portal to enter.
     */
    objectId: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
