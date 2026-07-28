import { SlotObjectData } from '../../../data';
import { PaymentType, PetUpgradeType } from '../../../models';

export type PetUpgradeOperation =
  | { kind: 'yard'; objectId: number; paymentType: PaymentType }
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
  | { kind: 'backpack'; petId: number }
  | {
      kind: 'unknown';
      transactionType: number;
      firstPetId: number;
      secondPetId: number;
      objectId: number;
      paymentType: PaymentType;
      slots: SlotObjectData[];
    };

export interface PetUpgradeWireState {
  petTransType: PetUpgradeType;
  pIdOne: number;
  pIdTwo: number;
  objectId: number;
  paymentType: PaymentType;
  slotObjects: SlotObjectData[];
}

export function petYardUpgrade(objectId: number, paymentType: PaymentType): PetUpgradeOperation {
  return { kind: 'yard', objectId, paymentType };
}

export function feedPet(
  petId: number,
  slots: SlotObjectData[],
  paymentType: PaymentType,
  objectId: number = 0,
): PetUpgradeOperation {
  return { kind: 'feed', petId, slots, paymentType, objectId };
}

export function fusePets(
  firstPetId: number,
  secondPetId: number,
  paymentType: PaymentType,
  objectId: number = 0,
): PetUpgradeOperation {
  return { kind: 'fuse', firstPetId, secondPetId, paymentType, objectId };
}

export function expandPetBackpack(petId: number): PetUpgradeOperation {
  return { kind: 'backpack', petId };
}

export function applyPetUpgradeOperation(
  state: PetUpgradeWireState,
  operation: PetUpgradeOperation,
): void {
  state.petTransType =
    operation.kind === 'unknown'
      ? (operation.transactionType as PetUpgradeType)
      : {
          yard: PetUpgradeType.PetYard,
          feed: PetUpgradeType.FeedPet,
          fuse: PetUpgradeType.FusePet,
          backpack: PetUpgradeType.PetBackpack,
        }[operation.kind];
  state.pIdOne =
    operation.kind === 'feed' || operation.kind === 'backpack'
      ? operation.petId
      : operation.kind === 'fuse'
        ? operation.firstPetId
        : operation.kind === 'unknown'
          ? operation.firstPetId
          : 0;
  state.pIdTwo =
    operation.kind === 'fuse'
      ? operation.secondPetId
      : operation.kind === 'unknown'
        ? operation.secondPetId
        : 0;
  state.objectId = 'objectId' in operation ? operation.objectId : 0;
  state.paymentType = 'paymentType' in operation ? operation.paymentType : 0;
  state.slotObjects =
    operation.kind === 'feed' || operation.kind === 'unknown'
      ? operation.slots.map((slot) => slot.clone())
      : [];
}

export function projectPetUpgradeOperation(state: PetUpgradeWireState): PetUpgradeOperation {
  switch (state.petTransType) {
    case PetUpgradeType.PetYard:
      return { kind: 'yard', objectId: state.objectId, paymentType: state.paymentType };
    case PetUpgradeType.FeedPet:
      return {
        kind: 'feed',
        petId: state.pIdOne,
        objectId: state.objectId,
        paymentType: state.paymentType,
        slots: state.slotObjects.map((slot) => slot.clone()),
      };
    case PetUpgradeType.FusePet:
      return {
        kind: 'fuse',
        firstPetId: state.pIdOne,
        secondPetId: state.pIdTwo,
        objectId: state.objectId,
        paymentType: state.paymentType,
      };
    case PetUpgradeType.PetBackpack:
      return { kind: 'backpack', petId: state.pIdOne };
    default:
      return {
        kind: 'unknown',
        transactionType: state.petTransType,
        firstPetId: state.pIdOne,
        secondPetId: state.pIdTwo,
        objectId: state.objectId,
        paymentType: state.paymentType,
        slots: state.slotObjects.map((slot) => slot.clone()),
      };
  }
}
