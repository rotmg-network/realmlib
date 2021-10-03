import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to invite a player to the client's current guild.
 */
export declare class GuildInvitePacket implements Packet {
    readonly type = PacketType.GUILDINVITE;
    /**
     * The name of the player to invite.
     */
    name: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
