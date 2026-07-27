import { expect } from 'chai';
import {
  BuyPacket,
  BuyResultPacket,
  CheckCreditsPacket,
  ClaimAccountLevelRewardPacket,
  ClaimAccountLevelRewardResultPacket,
  ClaimBattlePassPacket,
  ClaimBpMilestoneResultPacket,
  ClaimDailyRewardMessage,
  ClaimRewardPacket,
  ClaimRewardTrack,
  ClaimRewardResultPacket,
  ClaimRewardsInfoPromptPacket,
  ClaimRewardsInfoRequestPacket,
  DEFAULT_PACKET_MAP,
  Packet,
  PacketType,
  PaymentType,
  PetUpgradeRequestPacket,
  PetUpgradeType,
  NotificationEffect,
  NotificationPacket,
  Reader,
  RedeemVoucherPacket,
  SlotObjectData,
  UpgradeEnchanterPacket,
  VoucherResultPacket,
  Writer,
  createPacket,
} from '../src';

function readerFromHex(hex: string): Reader {
  const body = Buffer.from(hex, 'hex');
  const reader = new Reader(body.length);
  body.copy(reader.buffer);
  return reader;
}

function writeHex(packet: Packet): string {
  const writer = new Writer();
  packet.write(writer);
  return writer.buffer.subarray(0, writer.index).toString('hex');
}

function parse<T extends Packet>(packet: T, hex: string): T {
  const reader = readerFromHex(hex);
  packet.read(reader);
  expect(reader.remaining).to.equal(0);
  return packet;
}

describe('Exalt proxy findings (2026-07-27)', () => {
  it('maps and constructs the newly decoded battle-pass pair', () => {
    expect(DEFAULT_PACKET_MAP[149]).to.equal(PacketType.CLAIM_BATTLE_PASS);
    expect(DEFAULT_PACKET_MAP[PacketType.CLAIM_BATTLE_PASS]).to.equal(149);
    expect(DEFAULT_PACKET_MAP[150]).to.equal(PacketType.CLAIM_BP_MILESTONE_RESULT);
    expect(createPacket(PacketType.CLAIM_BATTLE_PASS)).to.be.instanceOf(ClaimBattlePassPacket);
    expect(createPacket(PacketType.CLAIM_BP_MILESTONE_RESULT)).to.be.instanceOf(ClaimBpMilestoneResultPacket);
  });

  it('replays the captured 149 -> 150 battle-pass exchange byte-exact', () => {
    const requestHex = '00103437363939373432323532343030363402';
    const request = parse(new ClaimBattlePassPacket(), requestHex);
    expect(request.passId).to.equal('4769974225240064');
    expect(request.tier).to.equal(2);
    expect(writeHex(request)).to.equal(requestHex);

    const result = parse(new ClaimBpMilestoneResultPacket(), '01');
    expect(result.success).to.equal(true);
    expect(writeHex(result)).to.equal('01');
  });

  it('replays the 239 -> 170 reward-prompt exchange', () => {
    const request = parse(new ClaimRewardsInfoRequestPacket(), '0000230c');
    expect(request.chestItemType).to.equal(0x230c);

    const resultHex = '0000230c0300060000109c0000058400000baf0000c17f00005c8a0000748c';
    const result = parse(new ClaimRewardsInfoPromptPacket(), resultHex);
    expect(result.chestItemType).to.equal(request.chestItemType);
    expect(result.chestType).to.equal(3);
    expect(result.items).to.deep.equal([0x109c, 0x0584, 0x0baf, 0xc17f, 0x5c8a, 0x748c]);
    expect(writeHex(result)).to.equal(resultHex);
  });

  it('parses account-level choices and structured item grant metadata', () => {
    const request = parse(new ClaimAccountLevelRewardPacket(), '00062c2c312c2c2c00000033');
    expect(request.selectedChoiceSlots).to.equal(',,1,,,');
    expect(request.rewardId).to.equal(51);

    const resultHex =
      '0133002b6974656d3a5374616666206f662074686520566974616c20556e6974793a3333365f3237325f2d335f2d33';
    const result = parse(new ClaimAccountLevelRewardResultPacket(), resultHex);
    expect(result.success).to.equal(true);
    expect(result.rewardId).to.equal(51);
    expect(result.grants).to.deep.equal([{
      raw: 'item:Staff of the Vital Unity:336_272_-3_-3',
      kind: 'item',
      value: 'Staff of the Vital Unity:336_272_-3_-3',
      itemName: 'Staff of the Vital Unity',
      skinData: '336_272_-3_-3',
    }]);
    expect(writeHex(result)).to.equal(resultHex);
  });

  it('splits multiple account-level grants and parses fame amounts', () => {
    const result = new ClaimAccountLevelRewardResultPacket();
    result.grantedRewardDescription =
      'item:Stellar Conqueror Title Unlocker,item:Starry-eyed Craig Emote,fame:1000';
    expect(result.grants.map((grant) => grant.kind)).to.deep.equal(['item', 'item', 'fame']);
    expect(result.grants[2].fame).to.equal(1000);
  });

  it('replays both claim-all request track bytes and its result header', () => {
    expect(parse(new ClaimRewardPacket(), '00').unknownByte).to.equal(0);
    expect(parse(new ClaimRewardPacket(), '01').unknownByte).to.equal(1);

    const result = parse(new ClaimRewardResultPacket(), '01000b3c53756363657373202f3e0000');
    expect(result.success).to.equal(true);
    expect(result.xml).to.equal('<Success />');
    expect(result.unknownShort).to.equal(0);
  });

  it('constructs claim-all requests through the typed reward-track API', () => {
    expect(writeHex(ClaimRewardPacket.forTrack(ClaimRewardTrack.Free))).to.equal('00');
    expect(writeHex(ClaimRewardPacket.forTrack(ClaimRewardTrack.Premium))).to.equal('01');
  });

  it('replays BUY, BUYRESULT, and the empty CHECKCREDITS request', () => {
    const buy = parse(new BuyPacket(), '000020ff00000001');
    expect(buy.objectType).to.equal(8447);
    expect(buy.objectId).to.equal(8447);
    expect(buy.quantity).to.equal(1);

    const resultHex = '0000000000157b226b223a22732e6275795f73756363657373227d';
    const result = parse(new BuyResultPacket(), resultHex);
    expect(result.result).to.equal(0);
    expect(result.parseJson()).to.deep.equal({ k: 's.buy_success' });
    expect(writeHex(new CheckCreditsPacket())).to.equal('');
  });

  it('replays the captured daily-login Datastore key request', () => {
    const hex =
      '005e61684e795a5746736257396d6447686c6257466b5a32396b61484a6b6369384c4567644259324e766457353047494341774b6d677337734944417353446b5268615778355447396e6157354559585268474943416f705769713430494441000e6e6f6e636f6e7365637574697665';
    const request = parse(new ClaimDailyRewardMessage(), hex);
    expect(request.claimKey).to.have.length(94);
    expect(request.claimType).to.equal('nonconsecutive');
    expect(writeHex(request)).to.equal(hex);
  });

  it('replays all three documented PETUPGRADEREQUEST forms', () => {
    const yardHex = '0100000000000000000000193f000000';
    const yard = parse(new PetUpgradeRequestPacket(), yardHex);
    expect(yard.petTransType).to.equal(PetUpgradeType.PetYard);
    expect(yard.objectId).to.equal(6463);
    expect(yard.slotObjects).to.deep.equal([]);
    expect(writeHex(yard)).to.equal(yardHex);

    const feedHex =
      '020000001c00000000000000000100030000080e00000004000037c70000080e00000006000037c70000080e00000008000037c7';
    const feed = parse(new PetUpgradeRequestPacket(), feedHex);
    expect(feed.petTransType).to.equal(PetUpgradeType.FeedPet);
    expect(feed.pIdOne).to.equal(28);
    expect(feed.paymentType).to.equal(PaymentType.Fame);
    expect(feed.slotObjects).to.have.length(3);
    expect(feed.slotObjects[0]).to.deep.include({ objectId: 2062, slotId: 4, objectType: 14279 });
    expect(writeHex(feed)).to.equal(feedHex);

    const fuseHex = '030000001d0000001c00000000010000';
    const fuse = parse(new PetUpgradeRequestPacket(), fuseHex);
    expect(fuse.petTransType).to.equal(PetUpgradeType.FusePet);
    expect(fuse.pIdOne).to.equal(29);
    expect(fuse.pIdTwo).to.equal(28);
    expect(fuse.paymentType).to.equal(PaymentType.Fame);
    expect(writeHex(fuse)).to.equal(fuseHex);
  });

  it('replays the captured pet-backpack upgrade form', () => {
    const backpackHex = '040000001d0000000000000000000000';
    const backpack = parse(new PetUpgradeRequestPacket(), backpackHex);
    expect(backpack.petTransType).to.equal(PetUpgradeType.PetBackpack);
    expect(backpack.operation).to.deep.equal({ kind: 'backpack', petId: 29 });
    expect(writeHex(backpack)).to.equal(backpackHex);
    expect(writeHex(PetUpgradeRequestPacket.backpack(29))).to.equal(backpackHex);
  });

  it('constructs and inspects pet-upgrade variants without raw field assembly', () => {
    const slot = SlotObjectData.from(2062, 4, 14279);
    const feed = PetUpgradeRequestPacket.feed(28, [slot], PaymentType.Fame);
    expect(feed.operation).to.deep.include({
      kind: 'feed',
      petId: 28,
      paymentType: PaymentType.Fame,
    });

    const fuse = PetUpgradeRequestPacket.fuse(29, 28, PaymentType.Fame);
    expect(fuse.operation).to.deep.include({
      kind: 'fuse',
      firstPetId: 29,
      secondPetId: 28,
    });
  });

  it('exposes notification payloads as discriminated variants', () => {
    const queue = parse(new NotificationPacket(), '0500000000330007');
    expect(queue.payload).to.deep.equal({
      kind: 'queue',
      effect: NotificationEffect.REALM_QUEUE,
      extra: 0,
      objectId: 51,
      queuePosition: 7,
    });
  });

  it('accepts varying UPGRADE_ENCHANTER item types', () => {
    for (const itemType of [0x0a9c, 0xce44, 0xce6f]) {
      const packet = new UpgradeEnchanterPacket();
      packet.value = 123;
      packet.itemType = itemType;
      packet.flag = 0;
      const replay = parse(new UpgradeEnchanterPacket(), writeHex(packet));
      expect(replay.itemType).to.equal(itemType);
    }
  });

  it('maps and constructs REDEEM_VOUCHER and VOUCHER_RESULT handlers', () => {
    expect(DEFAULT_PACKET_MAP[PacketType.REDEEM_VOUCHER]).to.equal(219);
    expect(DEFAULT_PACKET_MAP[PacketType.VOUCHER_RESULT]).to.equal(220);
    expect(createPacket(PacketType.REDEEM_VOUCHER)).to.be.instanceOf(RedeemVoucherPacket);
    expect(createPacket(PacketType.VOUCHER_RESULT)).to.be.instanceOf(VoucherResultPacket);
  });

  it('replays the captured voucher failure response without leftovers', () => {
    const request = new RedeemVoucherPacket();
    request.code = 'voucher_code';
    expect(writeHex(request)).to.equal('000c766f75636865725f636f6465');

    const resultHex =
      '000018566f7563686572732e566f75636865724e6f744578697374000c766f75636865725f636f6465';
    const result = parse(new VoucherResultPacket(), resultHex);
    expect(result.success).to.equal(false);
    expect(result.resultKey).to.equal('Vouchers.VoucherNotExist');
    expect(result.strings[1]).to.equal('voucher_code');
    expect(writeHex(result)).to.equal(resultHex);
  });
});
