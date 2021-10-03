import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * > Unknown.
 */
export declare class InvResultPacket implements Packet {
    readonly type = PacketType.INVRESULT;
    /**
     * > Unknown.
     */
    result: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
