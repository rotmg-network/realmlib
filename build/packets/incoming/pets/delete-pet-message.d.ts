import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Received to notify the player that a pet has been deleted.
 */
export declare class DeletePetMessage implements Packet {
    readonly type = PacketType.DELETE_PET;
    propagate: boolean;
    /**
     * The id of the pet which has been deleted.
     */
    petId: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
