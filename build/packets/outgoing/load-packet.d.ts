import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent in response to a `MapInfoPacket` to load a character into the map.
 */
export declare class LoadPacket implements Packet {
    readonly type = PacketType.LOAD;
    /**
     * The id of the character to load.
     */
    charId: number;
    /**
     * Whether or not the `MapInfoPacket` being responded to is from the arena.
     */
    isFromArena: boolean;
    /**
     * Whether or not the character is in challenger mode.
     */
    isChallenger: boolean;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
