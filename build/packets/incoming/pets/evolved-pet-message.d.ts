import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Received to give the player information about a newly evolved pet.
 */
export declare class EvolvedPetMessage implements Packet {
    readonly type = PacketType.EVOLVE_PET;
    propagate: boolean;
    /**
     * The id of the pet which has evolved.
     */
    petId: number;
    /**
     * The current skin id of the pet.
     */
    initialSkin: number;
    /**
     * The skin id of the pet after its evolution.
     */
    finalSkin: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
