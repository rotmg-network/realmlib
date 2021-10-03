import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Received to notify the player of a new pet.
 */
export declare class ActivePetPacket implements Packet {
    readonly type = PacketType.ACTIVEPETUPDATE;
    propagate: boolean;
    /**
     * The instance id of the active pet.
     */
    instanceId: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
