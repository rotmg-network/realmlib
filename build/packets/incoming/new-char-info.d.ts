import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * > Unknown
 */
export declare class NewCharacterInfoPacket implements Packet {
    readonly type = PacketType.NEW_CHARACTER_INFORMATION;
    charXML: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
