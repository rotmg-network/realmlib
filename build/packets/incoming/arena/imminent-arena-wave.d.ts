import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Received when a new arena wave is about to begin.
 */
export declare class ImminentArenaWavePacket implements Packet {
    readonly type = PacketType.IMMINENT_ARENA_WAVE;
    propagate: boolean;
    /**
     * The length of time the player has been in the arena for.
     */
    currentRuntime: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
