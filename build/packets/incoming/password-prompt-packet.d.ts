import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to prompt the player to enter their password
 */
export declare class PasswordPromptPacket implements Packet {
    readonly type = PacketType.PASSWORD_PROMPT;
    cleanPasswordStatus: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
