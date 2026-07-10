import { expect } from 'chai';
import {
  DEFAULT_PACKET_MAP,
  EnchantPacket,
  PacketType,
  Reader,
  ResetEnchantmentRerollCountPacket,
  ResetEnchantmentRerollCountResultPacket,
  ClaimDailyItemPacket,
  Writer,
  createPacket,
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

describe('enchant packets (biglog)', () => {
  it('RESET_ENCHANTMENT_REROLL_COUNT (191) parses its "tier:qty" dust buy', () => {
    // Captured "4:7" = buy 7 tier-4 dust; gold went 250->222, dust t4 73->80.
    const p = fromHex(new ResetEnchantmentRerollCountPacket(), '0003343a37');
    expect(p.value).to.equal('4:7');
    roundTripsTo(p, '0003343a37');
  });

  it('191 is now registered (was nofactory)', () => {
    expect(DEFAULT_PACKET_MAP[191]).to.equal(PacketType.RESET_ENCHANTMENT_REROLL_COUNT);
    expect(createPacket(PacketType.RESET_ENCHANTMENT_REROLL_COUNT))
      .to.be.instanceOf(ResetEnchantmentRerollCountPacket);
  });

  it('RESET_ENCHANTMENT_REROLL_COUNT_RESULT (192) parses the success byte', () => {
    const p = fromHex(new ResetEnchantmentRerollCountResultPacket(), '01');
    expect(p.success).to.equal(true);
    expect(DEFAULT_PACKET_MAP[192]).to.equal(PacketType.RESET_ENCHANTMENT_REROLL_COUNT_RESULT);
    roundTripsTo(p, '01');
  });

  it('ENCHANT (190) is the reroll success byte', () => {
    const p = fromHex(new EnchantPacket(), '01');
    expect(p.success).to.equal(true);
  });
});

describe('ClaimDailyItemPacket (daily-login data)', () => {
  it('parses byte + key(base64) + category, zero leftover', () => {
    // Captured: flag 1, base64 datastore key, category "nonconsecutive".
    const hex = '01005e61684e795a5746736257396d6447686c6257466b5a32396b61484a6b6369384c4567644259324e766457353047494341774b6d677337734944417353446b5268615778355447396e6157354559585268474943416f7137686b59514b4441000e6e6f6e636f6e7365637574697665';
    const p = fromHex(new ClaimDailyItemPacket  (), hex);
    expect(p.flag).to.equal(1);
    expect(p.category).to.equal('nonconsecutive');
    expect(Buffer.from(p.key, 'base64').toString('latin1')).to.contain('DailyLoginData');
    roundTripsTo(p, hex);
  });

  it('parses the empty-key "all" variant', () => {
    const p = fromHex(new ClaimDailyItemPacket(), '0100000003616c6c');
    expect(p.flag).to.equal(1);
    expect(p.key).to.equal('');
    expect(p.category).to.equal('all');
    roundTripsTo(p, '0100000003616c6c');
  });

  it('is mapped at id 237', () => {
    expect(DEFAULT_PACKET_MAP[237]).to.equal(PacketType.CLAIM_DAILY_ITEM);
  });
});
