import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Received to give the player information about a newly hatched pet
 */
export declare class HatchPetMessage implements Packet {
    readonly type = PacketType.HATCH_PET;
    propagate: boolean;
    /**
     * The name of the hatched pet
     */
    petName: string;
    /**
     * The skin id of the hatched pet
     */
    petSkin: number;
    /**
     * The object type of the pet
     */
    petType: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
