import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to remove a player from the client's current guild.
 */
export declare class GuildRemovePacket implements Packet {
    readonly type = PacketType.GUILDREMOVE;
    /**
     * The name of the player to remove.
     */
    name: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
