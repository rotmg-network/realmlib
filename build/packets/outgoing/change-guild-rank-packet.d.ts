import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to change the guild rank of a member in the player's guild.
 */
export declare class ChangeGuildRankPacket implements Packet {
    readonly type = PacketType.CHANGEGUILDRANK;
    /**
     * The name of the player whose rank will change.
     */
    name: string;
    /**
     * The new rank of the player.
     */
    guildRank: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
