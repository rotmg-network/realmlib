import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to create a new character.
 */
export declare class CreatePacket implements Packet {
    readonly type = PacketType.CREATE;
    /**
     * The class to use for the new character.
     */
    classType: number;
    /**
     * The skin id to use for the new character.
     * The default skin id is `0`.
     */
    skinType: number;
    /**
     * Whether or not the character is in challenger mode.
     */
    isChallenger: boolean;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
