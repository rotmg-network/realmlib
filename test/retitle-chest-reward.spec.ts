import { expect } from 'chai';
import {
  ChestRewardResultPacket,
  ClaimChestRewardPacket,
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

  it('CLAIM_CHEST_REWARD parses byte + slot + short', () => {
    const p = fromHex(new ClaimChestRewardPacket(), '0100000249000000040000ff220001');
    expect(p.unknownByte).to.equal(1);
    expect(p.slotObject.objectId).to.equal(0x249);
    expect(p.slotObject.slotId).to.equal(4);
    expect(p.slotObject.objectType).to.equal(0xff22);
    expect(p.unknownShort).to.equal(1);
    roundTripsTo(p, '0100000249000000040000ff220001');
  });

  it('CHEST_REWARD_RESULT parses the awarded item', () => {
    const p = fromHex(new ChestRewardResultPacket(), '000100009414');
    expect(p.itemType).to.equal(0x9414);
    roundTripsTo(p, '000100009414');
  });
});
