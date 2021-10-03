import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to accept a pending guild invite.
 */
export declare class JoinGuildPacket implements Packet {
    readonly type = PacketType.JOINGUILD;
    /**
     * The name of the guild for which there is a pending invite.
     */
    guildName: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
