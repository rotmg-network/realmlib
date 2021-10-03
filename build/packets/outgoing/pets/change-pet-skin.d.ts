import { PaymentType } from '../../../models';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Sent to change skin of a pet
 */
export declare class ChangePetSkinPacket implements Packet {
    readonly type = PacketType.PET_CHANGE_SKIN_MSG;
    /**
     * The id of the pet whose skin is changing
     */
    petId: number;
    /**
     * The id of the new skin for the pet
     */
    skinType: number;
    /**
     * The type of currency to use when changing the pet skin
     */
    currency: PaymentType;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
