import { expect } from 'chai';
import {
  AccountListPacket,
  ClaimAccountLevelRewardResultPacket,
  ClaimBattlePassPacket,
  ClaimRewardsInfoPromptPacket,
  ChestRewardResultPacket,
  ForgeResultPacket,
  PACKET_REGISTRY,
  PacketType,
  SlotObjectData,
  Unknown224Packet,
  UnlockMissionTreePacket,
  VoucherResultPacket,
} from '../src';
import { parseHex, readerFromHex, roundTrip, writeHex } from './support/codec';

describe('account-mutation and reward protocol audit', () => {
  it('keeps packet identity scoped by direction for the audited result flow', () => {
    const request = PACKET_REGISTRY.find(
      (entry) => entry.direction === 'outgoing' && entry.type === PacketType.CLAIM_REWARD,
    );
    const response = PACKET_REGISTRY.find(
      (entry) => entry.direction === 'incoming' && entry.type === PacketType.CLAIM_REWARD_RESULT,
    );

    expect(request).to.include({ id: 234, direction: 'outgoing' });
    expect(response).to.include({ id: 235, direction: 'incoming' });
  });

  it('models mission-tree unlock 224 under its canonical name and retains legacy accessors', () => {
    const canonical = parseHex(new UnlockMissionTreePacket(), '00000033');
    expect(canonical.boardId).to.equal(51);
    expect(canonical.unknownInt).to.equal(51);
    expect(writeHex(canonical)).to.equal('00000033');

    const legacy = new Unknown224Packet();
    legacy.unknownInt = 52;
    expect(legacy.boardId).to.equal(52);
    expect(legacy).to.be.instanceOf(UnlockMissionTreePacket);
  });

  it('preserves the signed battle-pass claim sentinel', () => {
    const claim = parseHex(new ClaimBattlePassPacket(), '000131ff');
    expect(claim.passId).to.equal('1');
    expect(claim.tier).to.equal(-1);
    expect(writeHex(claim)).to.equal('000131ff');
  });

  it('clears variable-length reward collections when packet instances are reused', () => {
    const chest = parseHex(new ChestRewardResultPacket(), '000200009588000033f1');
    chest.read(readerFromHex('0000'));
    expect(chest.items).to.deep.equal([]);

    const prompt = parseHex(new ClaimRewardsInfoPromptPacket(), '0000ff2702000200009588000033f1');
    prompt.read(readerFromHex('0000ff27030000'));
    expect(prompt.chestType).to.equal(3);
    expect(prompt.items).to.deep.equal([]);
  });

  it('clears conditional and repeatable result state on reused instances', () => {
    const accountLevel = parseHex(new ClaimAccountLevelRewardResultPacket(), '010100026f6b');
    accountLevel.read(readerFromHex('0001'));
    expect(accountLevel.success).to.equal(false);
    expect(accountLevel.rewardId).to.equal(1);
    expect(accountLevel.grantedRewardDescription).to.equal('');

    const voucher = parseHex(new VoucherResultPacket(), '01000161000162');
    voucher.read(readerFromHex('00000178'));
    expect(voucher.success).to.equal(false);
    expect(voucher.strings).to.deep.equal(['x']);
  });

  it('clears forge and account-list arrays, and round-trips the authoritative slot identity', () => {
    const forge = new ForgeResultPacket();
    forge.success = true;
    forge.results = [SlotObjectData.from(1, 2, 0x9588)];
    const decodedForge = roundTrip(forge, new ForgeResultPacket());
    expect(decodedForge.results).to.have.length(1);
    expect(decodedForge.results[0]).to.deep.include({ objectId: 1, slotId: 2, objectType: 0x9588 });
    decodedForge.read(readerFromHex('0000'));
    expect(decodedForge.success).to.equal(false);
    expect(decodedForge.results).to.deep.equal([]);

    const list = parseHex(new AccountListPacket(), '00000000000200016100016200000000');
    list.read(readerFromHex('00000001000000000000'));
    expect(list.accountListId).to.equal(1);
    expect(list.accountIds).to.deep.equal([]);
  });
});
