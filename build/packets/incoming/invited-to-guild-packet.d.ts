import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when the player is invited to a guild.
 */
export declare class InvitedToGuildPacket implements Packet {
    readonly type = PacketType.INVITEDTOGUILD;
    /**
     * The name of the player who sent the invite.
     */
    name: string;
    /**
     * The name of the guild which the invite is for.
     */
    guildName: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
