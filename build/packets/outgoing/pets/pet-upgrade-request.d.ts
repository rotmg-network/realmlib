import { SlotObjectData } from '../../../data';
import { PaymentType, PetUpgradeType } from '../../../models';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Sent when you are feeding and fusing pets or upgrading your pet yard
 */
export declare class PetUpgradeRequestPacket implements Packet {
    readonly type = PacketType.PETUPGRADEREQUEST;
    /**
     * The upgrade transaction type
     */
    petTransType: PetUpgradeType;
    /**
     * The object ID of the first pet
     */
    pIdOne: number;
    /**
     * The object ID of the second pet
     */
    pIdTwo: number;
    /**
     * The owner's object ID
     */
    objectId: number;
    /**
     * The items which will be used to upgrade the pet
     */
    slotObjects: SlotObjectData[];
    /**
     * The type of currency which will be used to purchase the upgrade
     */
    paymentType: PaymentType;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
    toString(showSlots?: boolean): string;
}
