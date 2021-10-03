import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * A packet which contains a bitmap image
 */
export declare class PicPacket implements Packet {
    readonly type = PacketType.PIC;
    /**
     * The width of the image.
     */
    width: number;
    /**
     * The height of the image.
     */
    height: number;
    /**
     * The bitmap data of the image.
     */
    bitmapData: number[];
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
