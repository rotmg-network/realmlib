import { SlotObjectData } from '../../../data';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Sent to make an update to the pet currently following the player
 */
export declare class ReskinPetPacket implements Packet {
    readonly type = PacketType.PET_CHANGE_FORM_MSG;
    /**
     * The instance id of the pet to update
     */
    instanceId: number;
    /**
     * The pet type that the pet will become after the form change
     */
    newPetType: number;
    /**
     * The slot object of a pet stone if one is used
     */
    item: SlotObjectData;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
    toString(): string;
}
