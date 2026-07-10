import { expect } from 'chai';
import { AccountListType, EditAccountListPacket, Reader, Writer } from '../src';

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

describe('EditAccountListPacket (editaccountlist log)', () => {
  it('parses a captured "lock add" (listId 0, add true)', () => {
    // #831: lock-add player object 241011 (0x3ad73).
    const p = fromHex(new EditAccountListPacket(), '00000000010003ad73');
    expect(p.accountListId).to.equal(AccountListType.Lock);
    expect(p.add).to.equal(true);
    expect(p.objectId).to.equal(241011);
    roundTripsTo(p, '00000000010003ad73');
  });

  it('parses a captured "ignore add" (listId 1, add true)', () => {
    // #1222: ignore-add player object 241847 (0x3b0b7).
    const p = fromHex(new EditAccountListPacket(), '00000001010003b0b7');
    expect(p.accountListId).to.equal(AccountListType.Ignore);
    expect(p.add).to.equal(true);
    expect(p.objectId).to.equal(241847);
    roundTripsTo(p, '00000001010003b0b7');
  });

  it('parses a captured "lock remove" (listId 0, add false)', () => {
    // #990: lock-remove player object 241011.
    const p = fromHex(new EditAccountListPacket(), '00000000000003ad73');
    expect(p.accountListId).to.equal(AccountListType.Lock);
    expect(p.add).to.equal(false);
    expect(p.objectId).to.equal(241011);
    roundTripsTo(p, '00000000000003ad73');
  });
});
