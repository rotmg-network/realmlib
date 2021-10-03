import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received in response to a `BuyPacket`.
 */
export declare class BuyResultPacket implements Packet {
    readonly type = PacketType.BUYRESULT;
    /**
     * The result code.
     */
    result: number;
    /**
     * > Unknown.
     */
    resultString: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
