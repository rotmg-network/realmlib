import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to create a new guild.
 */
export declare class CreateGuildPacket implements Packet {
    readonly type = PacketType.CREATEGUILD;
    /**
     * The name of the guild being created.
     */
    name: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
