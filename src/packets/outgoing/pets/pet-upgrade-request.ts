import { SlotObjectData } from '../../../data';
import { PaymentType, PetUpgradeType } from '../../../models';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';

export type PetUpgradeOperation =
  | {
      kind: 'yard';
      objectId: number;
      paymentType: PaymentType;
    }
  | {
      kind: 'feed';
      petId: number;
      objectId: number;
      paymentType: PaymentType;
      slots: SlotObjectData[];
    }
  | {
      kind: 'fuse';
      firstPetId: number;
      secondPetId: number;
      objectId: number;
      paymentType: PaymentType;
    }
  | {
      kind: 'unknown';
      transactionType: number;
      firstPetId: number;
      secondPetId: number;
      objectId: number;
      paymentType: PaymentType;
      slots: SlotObjectData[];
    };

/**
 * Sent when feeding/fusing pets or upgrading the pet yard.
 *
 * The first byte discriminates the operation. All observed forms share the
 * same 16-byte base layout; feed requests append a short-counted list of
 * `SlotObjectData` entries. Keeping the common wire layout here also preserves
 * unknown operation values for debugging.
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

  /** Builds a pet-yard upgrade request with no item slots. */
  static yard(objectId: number, paymentType: PaymentType): PetUpgradeRequestPacket {
    const packet = new PetUpgradeRequestPacket();
    packet.petTransType = PetUpgradeType.PetYard;
    packet.objectId = objectId;
    packet.paymentType = paymentType;
    return packet;
  }

  /** Builds a pet-feed request from one or more inventory/container slots. */
  static feed(
    petId: number,
    slots: SlotObjectData[],
    paymentType: PaymentType,
    objectId: number = 0,
  ): PetUpgradeRequestPacket {
    const packet = new PetUpgradeRequestPacket();
    packet.petTransType = PetUpgradeType.FeedPet;
    packet.pIdOne = petId;
    packet.objectId = objectId;
    packet.paymentType = paymentType;
    packet.slotObjects = slots.map((slot) => slot.clone());
    return packet;
  }

  /** Builds a two-pet fusion request with no item slots. */
  static fuse(
    firstPetId: number,
    secondPetId: number,
    paymentType: PaymentType,
    objectId: number = 0,
  ): PetUpgradeRequestPacket {
    const packet = new PetUpgradeRequestPacket();
    packet.petTransType = PetUpgradeType.FusePet;
    packet.pIdOne = firstPetId;
    packet.pIdTwo = secondPetId;
    packet.objectId = objectId;
    packet.paymentType = paymentType;
    return packet;
  }

  /** Returns a discriminator-based view of the current request. */
  get operation(): PetUpgradeOperation {
    switch (this.petTransType) {
      case PetUpgradeType.PetYard:
        return { kind: 'yard', objectId: this.objectId, paymentType: this.paymentType };
      case PetUpgradeType.FeedPet:
        return {
          kind: 'feed',
          petId: this.pIdOne,
          objectId: this.objectId,
          paymentType: this.paymentType,
          slots: this.slotObjects.map((slot) => slot.clone()),
        };
      case PetUpgradeType.FusePet:
        return {
          kind: 'fuse',
          firstPetId: this.pIdOne,
          secondPetId: this.pIdTwo,
          objectId: this.objectId,
          paymentType: this.paymentType,
        };
      default:
        return {
          kind: 'unknown',
          transactionType: this.petTransType,
          firstPetId: this.pIdOne,
          secondPetId: this.pIdTwo,
          objectId: this.objectId,
          paymentType: this.paymentType,
          slots: this.slotObjects.map((slot) => slot.clone()),
        };
    }
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
    const slotObjectLen = reader.validateCollectionCount(reader.readShort(), 12, 'pet upgrade slots');
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
