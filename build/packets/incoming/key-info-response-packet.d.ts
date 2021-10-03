import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * > Unknown.
 */
export declare class KeyInfoResponsePacket implements Packet {
    readonly type = PacketType.KEY_INFO_RESPONSE;
    /**
     * > Unknown.
     */
    name: string;
    /**
     * > Unknown.
     */
    description: string;
    /**
     * > Unknown.
     */
    creator: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
