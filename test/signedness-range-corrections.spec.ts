import { expect } from 'chai';
import {
  BoostBpMilestonePacket,
  ChangeGuildRankPacket,
  ClaimChestRewardPacket,
  ClaimDailyItemPacket,
  ClaimMissionPacket,
  ClaimMissionResultPacket,
  ClaimRewardsInfoPromptPacket,
  CreatePartyPacket,
  CreepHitPacket,
  ForgeResultPacket,
  InvResultPacket,
  PartyInviteResponsePacket,
  PetUpgradeRequestPacket,
  PlayerCalloutPacket,
  ReconnectPacket,
  ServerPlayerShootPacket,
  SetAbilityPacket,
  UpdatePacket,
} from '../src';
import { parseHex, readerFromBuffer, writeBuffer, writeHex } from './support/codec';

describe('native signedness and range corrections', () => {
  it('preserves uint8 upper bounds in SERVERPLAYERSHOOT and its optional tail', () => {
    const body =
      '0000' +
      '00000000' +
      '00000000' +
      '0000000000000000' +
      '00000000' +
      '0000' +
      '00000000' +
      'ff' +
      'ff00000000';
    const packet = parseHex(new ServerPlayerShootPacket(), body);

    expect(packet.unknownByte).to.equal(0xff);
    expect(packet.hasMultiShot).to.equal(true);
    expect(packet.numShots).to.equal(0xff);
    expect(writeHex(packet)).to.equal(body);
  });

  it('preserves uint8 upper bounds across byte discriminator packets', () => {
    const guildRank = parseHex(new ChangeGuildRankPacket(), '0000ff');
    expect(guildRank.guildRank).to.equal(0xff);
    expect(writeHex(guildRank)).to.equal('0000ff');

    const callout = parseHex(new PlayerCalloutPacket(), 'ff00000000');
    expect(callout.calloutType).to.equal(0xff);
    expect(writeHex(callout)).to.equal('ff00000000');

    const milestone = parseHex(new BoostBpMilestonePacket(), '0000ff');
    expect(milestone.milestone).to.equal(0xff);
    expect(writeHex(milestone)).to.equal('0000ff');

    const missionResult = parseHex(new ClaimMissionResultPacket(), 'ff010000');
    expect(missionResult.slot).to.equal(0xff);
    expect(writeHex(missionResult)).to.equal('ff010000');

    const rewardPrompt = parseHex(new ClaimRewardsInfoPromptPacket(), '00000000ff0000');
    expect(rewardPrompt.chestType).to.equal(0xff);
    expect(writeHex(rewardPrompt)).to.equal('00000000ff0000');

    const chestClaim = parseHex(new ClaimChestRewardPacket(), `ff${'00'.repeat(12)}0000`);
    expect(chestClaim.execute).to.equal(0xff);
    expect(writeHex(chestClaim)).to.equal(`ff${'00'.repeat(12)}0000`);

    const invite = parseHex(new PartyInviteResponsePacket(), 'ffffffffff');
    expect(invite.partyId).to.equal(0xffffffff);
    expect(invite.accept).to.equal(0xff);
    expect(writeHex(invite)).to.equal('ffffffffff');

    const daily = parseHex(new ClaimDailyItemPacket(), 'ff00000000');
    expect(daily.flag).to.equal(0xff);
    expect(writeHex(daily)).to.equal('ff00000000');
  });

  it('preserves uint8 level and inventory acknowledgement types', () => {
    const updateBody = `${'00'.repeat(8)}ff000000`;
    const update = parseHex(new UpdatePacket(), updateBody);
    expect(update.levelType).to.equal(0xff);
    expect(update.tiles).to.deep.equal([]);
    expect(update.newObjects).to.deep.equal([]);
    expect(update.drops).to.deep.equal([]);
    expect(writeHex(update)).to.equal(updateBody);

    const invResultBody = `00ff${'00'.repeat(32)}`;
    const invResult = parseHex(new InvResultPacket(), invResultBody);
    expect(invResult.ackType).to.equal(0xff);
    expect(writeHex(invResult)).to.equal(invResultBody);
  });

  it('uses uint8 pet operation/payment bytes and the native uint16 slot count', () => {
    const minimalBody = `ff${'00'.repeat(12)}ff0000`;
    const minimal = parseHex(new PetUpgradeRequestPacket(), minimalBody);
    expect(minimal.petTransType).to.equal(0xff);
    expect(minimal.paymentType).to.equal(0xff);
    expect(minimal.slotObjects).to.deep.equal([]);
    expect(writeHex(minimal)).to.equal(minimalBody);

    const count = 0xffff;
    const maxCountBody = Buffer.alloc(16 + count * 12);
    maxCountBody.writeUInt8(0xff, 0);
    maxCountBody.writeUInt8(0xff, 13);
    maxCountBody.writeUInt16BE(count, 14);

    const reader = readerFromBuffer(maxCountBody);
    const maxCount = new PetUpgradeRequestPacket();
    maxCount.read(reader);
    expect(reader.remaining).to.equal(0);
    expect(maxCount.slotObjects).to.have.length(count);
    expect(writeBuffer(maxCount).equals(maxCountBody)).to.equal(true);
  });

  it('maps mission subId ffff to the public -1 sentinel and preserves uint16 values', () => {
    const sentinelBody = '0000003200000003ffffff';
    const sentinel = parseHex(new ClaimMissionPacket(), sentinelBody);
    expect(sentinel.slot).to.equal(0xff);
    expect(sentinel.subId).to.equal(-1);
    expect(writeHex(sentinel)).to.equal(sentinelBody);

    for (const subId of [0x8000, 0xfffe]) {
      const body = `000000000000000080${subId.toString(16).padStart(4, '0')}`;
      const packet = parseHex(new ClaimMissionPacket(), body);
      expect(packet.slot).to.equal(0x80);
      expect(packet.subId).to.equal(subId);
      expect(writeHex(packet)).to.equal(body);
    }
  });

  it('preserves all CREATE_PARTY unsigned upper bounds', () => {
    const body = `0000ffff${'ff'.repeat(5)}`;
    const packet = parseHex(new CreatePartyPacket(), body);

    expect(packet).to.include({
      description: '',
      minPowerLevel: 0xffff,
      maxPartySize: 0xff,
      activity: 0xff,
      maxedStatReq: 0xff,
      privacy: 0xff,
      serverIndex: 0xff,
    });
    expect(writeHex(packet)).to.equal(body);
  });

  it('preserves uint16 RECONNECT ports and CREEP_HIT bullet ids', () => {
    const reconnectBody = `00000000ffff${'00'.repeat(10)}`;
    const reconnect = parseHex(new ReconnectPacket(), reconnectBody);
    expect(reconnect.port).to.equal(0xffff);
    expect(writeHex(reconnect)).to.equal(reconnectBody);

    const creepHitBody = `00000000ffff${'00'.repeat(8)}`;
    const creepHit = parseHex(new CreepHitPacket(), creepHitBody);
    expect(creepHit.bulletId).to.equal(0xffff);
    expect(writeHex(creepHit)).to.equal(creepHitBody);
  });

  it('preserves signed SET_ABILITY selectors, including the -1 boundary', () => {
    const body = `00000000ff${'00'.repeat(8)}`;
    const packet = parseHex(new SetAbilityPacket(), body);

    expect(packet.ability).to.equal(-1);
    expect(writeHex(packet)).to.equal(body);
  });

  it('accepts zero-count forge success and the uint8 result-count upper bound', () => {
    const empty = parseHex(new ForgeResultPacket(), '0100');
    expect(empty.success).to.equal(true);
    expect(empty.results).to.deep.equal([]);
    expect(writeHex(empty)).to.equal('0100');

    const body = `01ff${'00'.repeat(0xff * 12)}`;
    const full = parseHex(new ForgeResultPacket(), body);
    expect(full.results).to.have.length(0xff);
    expect(writeHex(full)).to.equal(body);
  });
});
