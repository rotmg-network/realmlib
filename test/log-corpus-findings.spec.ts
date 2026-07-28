import { expect } from 'chai';
import type { BattlePassInfoResponse } from '../src';
import {
  ClaimChestRewardPacket,
  DamageWithEffectPacket,
  DEFAULT_PACKET_MAP,
  NotificationEffect,
  NotificationPacket,
  Packet,
  PacketType,
  Reader,
  TradeStartPacket,
  Unknown231Packet,
  Writer,
  createPacket,
} from '../src';

function parse<T extends Packet>(packet: T, hex: string): T {
  const body = Buffer.from(hex, 'hex');
  const reader = new Reader(body.length);
  body.copy(reader.buffer);
  packet.read(reader);
  expect(reader.remaining, 'no leftover bytes').to.equal(0);
  return packet;
}

function writeHex(packet: Packet): string {
  const writer = new Writer();
  packet.write(writer);
  return writer.buffer.subarray(0, writer.index).toString('hex');
}

describe('log corpus findings (2026-07-28)', () => {
  it('parses TRADESTART items with populated and empty metadata', () => {
    const hex = [
      '0002',
      '00000a740000000200000014414149456f4150395f5f335f5f66384641413d3d',
      'ffffffff0000000000000000',
      '0007506172746e6572',
      '0000',
      '000001a4',
      '01',
    ].join('');
    const packet = parse(new TradeStartPacket(), hex);

    expect(packet.clientItems).to.have.length(2);
    expect(packet.clientItems[0].item).to.equal(0x0a74);
    expect(packet.clientItems[0].itemData).to.equal('AAIEoAP9__3__f8FAA==');
    expect(packet.clientItems[1].item).to.equal(-1);
    expect(packet.clientItems[1].itemData).to.equal('');
    expect(packet.partnerName).to.equal('Partner');
    expect(packet.objectId).to.equal(420);
    expect(packet.unknownByte).to.equal(1);
    expect(writeHex(packet)).to.equal(hex);
  });

  it('round-trips the effect-12 behaviour notification payload', () => {
    const hex = '0c1a000c427269646765206f70656e2100000058002b2a28';
    const packet = parse(new NotificationPacket(), hex);

    expect(packet.effect).to.equal(NotificationEffect.BEHAVIOUR);
    expect(packet.extra).to.equal(26);
    expect(packet.message).to.equal('Bridge open!');
    expect(packet.objectTypeOrId).to.equal(88);
    expect(packet.colorOrType).to.equal(2_828_840);
    expect(packet.payload).to.deep.equal({
      kind: 'behaviour',
      effect: NotificationEffect.BEHAVIOUR,
      extra: 26,
      message: 'Bridge open!',
      objectTypeOrId: 88,
      colorOrType: 2_828_840,
    });
    expect(writeHex(packet)).to.equal(hex);
  });

  it('maps and round-trips incoming id 231 activation states as raw int32 values', () => {
    expect(DEFAULT_PACKET_MAP[231]).to.equal(PacketType.UNKNOWN231);
    expect(createPacket(PacketType.UNKNOWN231)).to.be.instanceOf(Unknown231Packet);

    const active = parse(new Unknown231Packet(), '0000000000000001');
    expect(active.unknownInt).to.equal(0);
    expect(active.active).to.equal(1);
    expect(writeHex(active)).to.equal('0000000000000001');

    const inactive = parse(new Unknown231Packet(), '0000000000000000');
    expect(inactive.unknownInt).to.equal(0);
    expect(inactive.active).to.equal(0);
    expect(writeHex(inactive)).to.equal('0000000000000000');
  });

  it('keeps DAMAGE_WITH_EFFECT generic when Curse precedes a Stasis magnitude', () => {
    const hex = '000001150126000000000000ffffff1640c00000';
    const packet = parse(new DamageWithEffectPacket(), hex);

    expect(packet.targetId).to.equal(277);
    expect(packet.effects).to.deep.equal([38]);
    expect(packet.damageAmount).to.equal(0);
    expect(packet.effectId).to.equal(22);
    expect(packet.value).to.equal(6);
    expect(writeHex(packet)).to.equal(hex);
  });

  it('preserves the chest-claim execute=0 request variant', () => {
    const hex = '00000002490000000c0000ffd10000';
    const packet = parse(new ClaimChestRewardPacket(), hex);

    expect(packet.execute).to.equal(0);
    expect(packet.unknownByte).to.equal(0);
    expect(packet.slotObject.objectType).to.equal(0xffd1);
    expect(packet.choiceIndex).to.equal(0);
    expect(writeHex(packet)).to.equal(hex);
  });

  it('models the AppEngine Battle Pass response separately from socket packets', () => {
    const response: BattlePassInfoResponse = {
      battlePass: {
        id: '4769974225240064',
        backgroundUrl: 'https://example.invalid/background.jpg',
        title: 'The Astral Path',
        start: 1_783_414_860,
        end: 1_785_833_999,
        milestones: [{
          bxp: 480_000_000,
          bxp_interval: 50_000_000,
          id: 77,
          rewards: {
            coupons: 0,
            exaltedCoupons: 0,
            credits: 0,
            exaltedCredits: 0,
            items: [{ amount: 1, autoconsume: false, type: 42_345 }],
            exaltItems: [],
          },
        }],
        exaltedPrice: 1_200,
        boost: [{ price: 600, amount: 1 }],
        weeklyBxpCap: 700_000_000,
        weeklyExaltBxpCap: 700_000_000,
        exaltDescription: '',
        bxp: 600_944_869,
        claimed: ['77'],
        exalted: true,
        coupons: 0,
        repeatables: { '77': 3 },
        previous: { coupons: 0 },
      },
    };

    expect(response.battlePass.claimed).to.deep.equal(['77']);
    expect(response.battlePass.repeatables).to.deep.equal({ '77': 3 });
    expect(response.battlePass.milestones[0].bxp_interval).to.equal(50_000_000);
  });
});
