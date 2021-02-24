import { SlotObjectData } from '../../../data';
import { PaymentType, PetUpgradeType } from '../../../models';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';

/**
 * Sent when you are feeding and fusing pets or upgrading your pet yard
 */
export class PetUpgradeRequestPacket implements Packet {

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

  constructor() {
    this.petTransType = 0;
    this.pIdOne = 0;
    this.pIdTwo = 0;
    this.objectId = 0;
    this.slotObjects = [];
    this.paymentType = 0;
  }

  write(writer: Writer): void {
    writer.writeByte(this.petTransType);
    writer.writeInt32(this.pIdOne);
    writer.writeInt32(this.pIdTwo);
    writer.writeInt32(this.objectId);
    writer.writeByte(this.paymentType);
    writer.writeShort(this.slotObjects.length);
    for (const slotObject of this.slotObjects) {
      slotObject.write(writer);
    }
  }

  read(reader: Reader): void {
    this.petTransType = reader.readByte();
    this.pIdOne = reader.readInt32();
    this.pIdTwo = reader.readInt32();
    this.objectId = reader.readInt32();
    this.paymentType = reader.readByte();
    const slotObjectLen = reader.readShort();
    this.slotObjects = new Array<SlotObjectData>(slotObjectLen);
    for (let i = 0; i < slotObjectLen; i++) {
      this.slotObjects[i] = new SlotObjectData();
      this.slotObjects[i].read(reader);
    }
  }

  toString(showSlots: boolean = true): string {
    let str = `[PetUpgradeRequest - 16] TransType: ${this.petTransType}\nPetIdOne: ${this.pIdOne}\nPetIdTwo: ${this.pIdTwo}\n
    ObjectId: ${this.objectId}\nPaymentType ${this.paymentType}\nSlot count: ${this.slotObjects.length}`;
    if (!showSlots) {
      return str;
    } else {
      for(let i = 0; i < this.slotObjects.length; i++) {
        if (i == 0) {
          str += `\n${this.slotObjects[i].toString()}\n`;
        } else if (i == this.slotObjects.length - 1) {
          str += this.slotObjects[i].toString();
        } else {
          str += `${this.slotObjects[i].toString()}\n`;
        }
      }
      return str;
    }
  }
}
