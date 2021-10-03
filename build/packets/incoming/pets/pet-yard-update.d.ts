import { PetYardType } from '../../../models';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Received when the pet yard is updated to a new type of yard
 */
export declare class PetYardUpdate implements Packet {
    readonly type = PacketType.PETYARDUPDATE;
    /**
     * The type of the new yard
     */
    yardType: PetYardType;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
