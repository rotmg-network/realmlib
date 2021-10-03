import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * > Unknown.
 */
export declare class KeyInfoRequestPacket implements Packet {
    readonly type = PacketType.KEY_INFO_REQUEST;
    /**
     * > Unknown.
     */
    itemType: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
