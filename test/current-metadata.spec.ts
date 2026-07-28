import { expect } from 'chai';
import {
  CampaignBoost,
  CharacterFilter,
  CharacterStatAxis,
  Classes,
  ContainerArea,
  DustType,
  FailureCode,
  InvResultFlags,
  InvResultSecondaryFlags,
  ItemCategory,
  MissionObjectiveType,
  MissionRewardKind,
  MissionState,
  MissionTrackingState,
  NotificationEffect,
  PartyAction,
  PartyActionPacket,
  PartyActionResult,
  PartyActionResultPacket,
  PetContainerTransferResult,
  Reader,
  ReskinUnlockPacket,
  ReskinUnlockType,
  StatType,
  Writer,
  parsePlayerClass,
} from '../src';

/** Serializes a packet and returns a reader over the resulting body. */
function serialize(packet: { write(writer: Writer): void }): Reader {
  const writer = new Writer();
  packet.write(writer);
  const reader = new Reader(writer.index);
  writer.buffer.copy(reader.buffer, 0, 0, writer.index);
  return reader;
}

describe('current-build metadata enums', () => {
  it('maps current player classes', () => {
    expect(Classes.Kensei).to.equal(818);
    expect(Classes.Druid).to.equal(819);
    expect(parsePlayerClass(Classes.Kensei)).to.equal('Kensei');
    expect(parsePlayerClass(Classes.Druid)).to.equal('Druid');
  });

  it('maps current and legacy stat aliases without changing wire IDs', () => {
    expect(StatType.PET_BACKPACK_SLOTS_STAT).to.equal(148);
    expect(StatType.UNKNOWN_148).to.equal(StatType.PET_BACKPACK_SLOTS_STAT);
    expect(StatType.UNKNOWN_150).to.equal(150);
    expect(StatType.UNKNOWN_151).to.equal(151);
    expect(StatType.NEW_CON_STAT).to.equal(96);
    expect(StatType.CHALLENGER_STARBG_STAT).to.equal(100);
  });

  it('preserves duplicate notification aliases from the current client', () => {
    expect(NotificationEffect.INVITE).to.equal(15);
    expect(NotificationEffect.MISSIONS_REFRESH).to.equal(15);
    expect(NotificationEffect.MISSIONS_PROGRESS_ONLY_REFRESH).to.equal(99);
    expect(NotificationEffect.MISSIONS_PROGRESS_REFRESH).to.equal(99);
  });

  it('maps mission metadata values', () => {
    expect(MissionObjectiveType.Unknown).to.equal(-1);
    expect(MissionObjectiveType.Consume).to.equal(20);
    expect(MissionObjectiveType.ForgeItemsTier).to.equal(41);
    expect(MissionRewardKind.Item).to.equal(0);
    expect(MissionRewardKind.BXP).to.equal(1);
    expect(MissionTrackingState.UnavailableToTrack).to.equal(2);
    expect(MissionTrackingState.Completed).to.equal(10);
    expect(MissionTrackingState.ClaimedOnCooldown).to.equal(21);
    expect(MissionState.OnCooldown).to.equal(3);
  });

  it('maps item, container, character-filter, and campaign metadata values', () => {
    expect(ItemCategory.Shiny).to.equal(8);
    expect(ContainerArea.BackpackExtension).to.equal(3);
    expect(CharacterStatAxis.None).to.equal(-1);
    expect(CharacterStatAxis.SummonPower).to.equal(8);
    expect(CharacterFilter.CrucibleSeasonal).to.equal(5);
    expect(CharacterFilter.OutsideBloodRitual).to.equal(7);
    expect(CampaignBoost.None).to.equal(-1);
    expect(CampaignBoost.ItemSlotChance).to.equal(11);
    expect(CampaignBoost.Damage).to.equal(21);
  });

  it('maps pet transfer results, dust aliases, and reserved failure values', () => {
    expect(PetContainerTransferResult.InvalidCantWithdrawFromPet).to.equal(2);
    expect(PetContainerTransferResult.InvalidCantPutOnPet).to.equal(3);
    expect(DustType.BlueDust).to.equal(2);
    expect(DustType.NlueDust).to.equal(DustType.BlueDust);
    expect(FailureCode.Unknown3).to.equal(3);
  });

  it('contains every inventory-result flag bit observed in the corpus', () => {
    const observedBits = [2, 3, 5, 6, 8, 12, 14, 15, 17, 18, 19, 20, 23, 29];
    for (const bit of observedBits) {
      expect(InvResultFlags[`Bit${bit}` as keyof typeof InvResultFlags]).to.equal(2 ** bit);
    }

    const observedSecondaryBits = [5, 10, 11, 15, 16, 18, 22, 27, 30];
    for (const bit of observedSecondaryBits) {
      expect(
        InvResultSecondaryFlags[`Bit${bit}` as keyof typeof InvResultSecondaryFlags],
      ).to.equal(2 ** bit);
    }
  });

  it('types and round trips current reskin unlock categories', () => {
    const packet = new ReskinUnlockPacket();
    packet.unlockType = ReskinUnlockType.Entrance;
    packet.unlockId = 1234;

    const result = new ReskinUnlockPacket();
    const reader = serialize(packet);
    result.read(reader);
    expect(result.unlockType).to.equal(ReskinUnlockType.Entrance);
    expect(result.unlockId).to.equal(1234);
    expect(reader.remaining).to.equal(0);
  });

  it('round trips typed party actions and the no-target sentinel', () => {
    const action = new PartyActionPacket();
    action.playerId = 42;
    action.actionId = PartyAction.PromoteToLeader;
    const actionResult = new PartyActionPacket();
    const actionReader = serialize(action);
    actionResult.read(actionReader);
    expect(actionResult.actionId).to.equal(PartyAction.PromoteToLeader);

    const result = new PartyActionResultPacket();
    result.playerId = 65535;
    result.actionId = PartyActionResult.LeftParty;
    const resultCopy = new PartyActionResultPacket();
    const resultReader = serialize(result);
    resultCopy.read(resultReader);
    expect(resultCopy.playerId).to.equal(65535);
    expect(resultCopy.actionId).to.equal(PartyActionResult.LeftParty);
    expect(resultReader.remaining).to.equal(0);
  });
});
