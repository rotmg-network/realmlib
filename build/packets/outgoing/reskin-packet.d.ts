import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to activate a new skin for the current character.
 */
export declare class ReskinPacket implements Packet {
    readonly type = PacketType.RESKIN;
    /**
     * The id of the skin to activate.
     */
    skinId: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
