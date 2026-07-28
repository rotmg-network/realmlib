import { expect } from 'chai';
import {
  ChestRewardResultPacket,
  ClaimChestRewardPacket,
  ClaimRewardsInfoPromptPacket,
  ClaimRewardsInfoRequestPacket,
  ExaltationUpdatePacket,
  Reader,
  RetitlePacket,
  Writer,
} from '../src';

function fromHex<T extends { read(r: Reader): void }>(packet: T, hex: string): T {
  const buf = Buffer.from(hex, 'hex');
  const reader = new Reader(buf.length);
  buf.copy(reader.buffer, 0, 0, buf.length);
  reader.index = 0;
  packet.read(reader);
  expect(reader.remaining, 'no leftover bytes').to.equal(0);
  return packet;
}

function roundTripsTo(packet: { write(w: Writer): void }, hex: string): void {
  const w = new Writer();
  packet.write(w);
  expect(w.buffer.subarray(0, w.index).toString('hex')).to.equal(hex);
}

describe('retitle / chest-reward packets (retitle-reskin log)', () => {
  it('RETITLE parses two title-slot ids', () => {
    const p = fromHex(new RetitlePacket(), '00009a0a00009a12');
    expect(p.titleId).to.equal(0x9a0a);
    expect(p.secondaryTitleId).to.equal(0x9a12);
    roundTripsTo(p, '00009a0a00009a12');
  });

  it('RETITLE round-trips the clear-both body', () => {
    const p = fromHex(new RetitlePacket(), '0000000000000000');
    expect(p.titleId).to.equal(0);
    expect(p.secondaryTitleId).to.equal(0);
    roundTripsTo(p, '0000000000000000');
  });

  it('CLAIM_CHEST_REWARD parses byte + slot + choice index', () => {
    const p = fromHex(new ClaimChestRewardPacket(), '0100000249000000040000ff220001');
    expect(p.execute).to.equal(1);
    expect(p.slotObject.objectId).to.equal(0x249);
    expect(p.slotObject.slotId).to.equal(4);
    expect(p.slotObject.objectType).to.equal(0xff22);
    expect(p.choiceIndex).to.equal(1);
    roundTripsTo(p, '0100000249000000040000ff220001');
  });

  it('CHEST_REWARD_RESULT parses the awarded item', () => {
    const p = fromHex(new ChestRewardResultPacket(), '000100009414');
    expect(p.items).to.deep.equal([0x9414]);
    roundTripsTo(p, '000100009414');
  });

  // The 2026-07-27 swaps-chest-potions capture, which is what pinned down the
  // fields these packets used to model as unknowns.
  it('replays the full type-2 chest open: inspect, prompt, claim, grant', () => {
    // Ctrl-inspect of the Advanced Ring Chest still in vault storage.
    const request = fromHex(new ClaimRewardsInfoRequestPacket(), '0000ff27');
    expect(request.chestItemType).to.equal(0xff27);

    // Its pool: chestType 2 (player chooses), one entry.
    const promptHex = '0000ff2702000100009588';
    const prompt = fromHex(new ClaimRewardsInfoPromptPacket(), promptHex);
    expect(prompt.chestItemType).to.equal(request.chestItemType);
    expect(prompt.chestType).to.equal(2);
    expect(prompt.items).to.deep.equal([0x9588]);
    roundTripsTo(prompt, promptHex);

    // The claim names the player and the inventory slot the chest was swapped
    // into, not the chest's own object id.
    const claimHex = '0100000249000000100000ff270000';
    const claim = fromHex(new ClaimChestRewardPacket(), claimHex);
    expect(claim.slotObject.objectId).to.equal(0x249);
    expect(claim.slotObject.slotId).to.equal(16);
    expect(claim.slotObject.objectType).to.equal(0xff27);
    expect(claim.choiceIndex).to.equal(0);
    roundTripsTo(claim, claimHex);

    const grant = fromHex(new ChestRewardResultPacket(), '000100009588');
    expect(grant.items).to.deep.equal([prompt.items[claim.choiceIndex]]);
  });

  it('replays a type-3 chest, where the server rolls and choiceIndex is ignored', () => {
    // Tarot Card Pack: ten entries, chestType 3.
    const promptHex =
      '0000343903000a000033db000033e6000033f100003407000034120000341d0000342800003433000033fc00003625';
    const prompt = fromHex(new ClaimRewardsInfoPromptPacket(), promptHex);
    expect(prompt.chestItemType).to.equal(0x3439);
    expect(prompt.chestType).to.equal(3);
    expect(prompt.items).to.have.length(10);
    roundTripsTo(prompt, promptHex);

    const claim = fromHex(new ClaimChestRewardPacket(), '01000002490000000c000034390000');
    expect(claim.choiceIndex).to.equal(0);

    // The grant is index 2, not the requested 0 — the server rolled it.
    const grant = fromHex(new ChestRewardResultPacket(), '0001000033f1');
    expect(grant.items).to.deep.equal([0x33f1]);
    expect(prompt.items.indexOf(grant.items[0])).to.equal(2);
  });

  it('CHEST_REWARD_RESULT survives a multi-item grant', () => {
    // No capture has produced one yet, but the short is a count: the old
    // byte/byte/int32 model would have read this as a single bogus item.
    const hex = '00020000958800009414';
    const p = fromHex(new ChestRewardResultPacket(), hex);
    expect(p.items).to.deep.equal([0x9588, 0x9414]);
    roundTripsTo(p, hex);
  });
});

describe('ExaltationUpdatePacket (114) — per-class power-up totals', () => {
  // The two bodies from the 2026-07-27 session, checked against that session's
  // /account/listPowerUpStats. Same eight numbers in the same order, including
  // the 1467 outlier, which is what pins the field order down.
  const POWER_UP_STATS: Record<number, Record<string, number>> = {
    785: { Dex: 118, Spd: 84, Vit: 96, Wis: 82, Def: 135, Att: 137, Mana: 150, Life: 96 },
    782: { Dex: 99, Spd: 1467, Vit: 150, Wis: 134, Def: 151, Att: 143, Mana: 149, Life: 152 },
  };

  function check(hex: string, objType: number): void {
    const p = fromHex(new ExaltationUpdatePacket(), hex);
    const expected = POWER_UP_STATS[objType];
    expect(p.objType).to.equal(objType);
    expect(p.dexterityProgress).to.equal(expected.Dex);
    expect(p.speedProgress).to.equal(expected.Spd);
    expect(p.vitalityProgress).to.equal(expected.Vit);
    expect(p.wisdomProgress).to.equal(expected.Wis);
    expect(p.defenseProgress).to.equal(expected.Def);
    expect(p.attackProgress).to.equal(expected.Att);
    expect(p.manaProgress).to.equal(expected.Mana);
    expect(p.healthProgress).to.equal(expected.Life);
    roundTripsTo(p, hex);
  }

  it('matches listPowerUpStats for the Samurai body', () => {
    check('0311b6019401a0019201870289029602a001', 785);
  });

  it('matches listPowerUpStats for the Wizard body, 1467 speed and all', () => {
    check('030ea301bb169602860297028f0295029802', 782);
  });
});
