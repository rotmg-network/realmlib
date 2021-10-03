import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * > Unknown.
 */
export declare class SquareHitPacket implements Packet {
    readonly type = PacketType.SQUAREHIT;
    /**
     * The current client time.
     */
    time: number;
    /**
     * > Unknown.
     */
    bulletId: number;
    /**
     * > Unknown.
     */
    objectId: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
