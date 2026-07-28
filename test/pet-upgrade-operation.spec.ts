import { expect } from 'chai';
import {
  applyPetUpgradeOperation,
  expandPetBackpack,
  feedPet,
  fusePets,
  PaymentType,
  PetUpgradeRequestPacket,
  petYardUpgrade,
  SlotObjectData,
} from '../src';

describe('pet upgrade operation helpers', () => {
  it('builds operations independently of the wire DTO', () => {
    expect(petYardUpgrade(10, PaymentType.Fame)).to.deep.equal({
      kind: 'yard',
      objectId: 10,
      paymentType: PaymentType.Fame,
    });
    expect(fusePets(1, 2, PaymentType.Gold)).to.deep.include({
      kind: 'fuse',
      firstPetId: 1,
      secondPetId: 2,
    });
    expect(expandPetBackpack(3)).to.deep.equal({ kind: 'backpack', petId: 3 });
  });

  it('applies and projects an operation without sharing slot objects', () => {
    const slot = new SlotObjectData();
    slot.objectId = 7;
    slot.slotId = 8;
    slot.objectType = 9;
    const operation = feedPet(42, [slot], PaymentType.Fame, 11);
    const packet = new PetUpgradeRequestPacket();

    applyPetUpgradeOperation(packet, operation);
    slot.objectId = 99;
    expect(packet.slotObjects[0].objectId).to.equal(7);

    const projected = packet.operation;
    expect(projected).to.deep.include({ kind: 'feed', petId: 42, objectId: 11 });
    if (projected.kind === 'feed') {
      projected.slots[0].objectId = 100;
    }
    expect(packet.slotObjects[0].objectId).to.equal(7);
  });
});
