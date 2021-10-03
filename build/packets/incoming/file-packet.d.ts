import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * A packet which contains a file.
 */
export declare class FilePacket implements Packet {
    readonly type = PacketType.FILE;
    /**
     * The name of the received file.
     */
    fileName: string;
    /**
     * The bytes of the file. Don't ask me why this is a string,
     * that's just how it is in the source code of the game.
     */
    file: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
