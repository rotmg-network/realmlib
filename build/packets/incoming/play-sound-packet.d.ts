import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to tell the client to play a sound
 */
export declare class PlaySoundPacket implements Packet {
    readonly type = PacketType.PLAYSOUND;
    /**
     * The object id of the origin of the sound
     */
    ownerId: number;
    /**
     * The id of the sound to play
     */
    soundId: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
