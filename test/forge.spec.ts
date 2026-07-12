import { expect } from 'chai';
import {
  BlacksmithDismantlePacket,
  BlacksmithRequestPacket,
  ForgeRequestPacket,
  ForgeResultPacket,
  Reader,
  SlotObjectData,
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

describe('forge / blacksmith packets (dupe log)', () => {
  it('FORGE_REQUEST parses resultItemType + dismantled items', () => {
    const hex = '0000228900000002000002570000000800000483000002570000000400000484';
    const p = fromHex(new ForgeRequestPacket(), hex);
    expect(p.resultItemType).to.equal(0x2289); // 8841
    expect(p.dismantledItems).to.have.length(2);
    expect(p.dismantledItems[0].objectType).to.equal(1155);
    expect(p.dismantledItems[1].objectType).to.equal(1156);
    roundTripsTo(p, hex);
  });

  it('FORGE_RESULT parses the success + count body', () => {
    const p = fromHex(new ForgeResultPacket(), '0100');
    expect(p.success).to.equal(true);
    expect(p.results).to.have.length(0);
    roundTripsTo(p, '0100');
  });

  it('FORGE_RESULT round-trips a non-empty result set (regression: write() bug)', () => {
    // Previously write() had an infinite-loop condition and skipped the count
    // byte, so a non-empty result set could never be serialised.
    const p = new ForgeResultPacket();
    p.success = true;
    p.results = [SlotObjectData.from(599, 3, 8841)];
    const w = new Writer();
    p.write(w);
    const echo = fromHex(new ForgeResultPacket(), w.buffer.subarray(0, w.index).toString('hex'));
    expect(echo.success).to.equal(true);
    expect(echo.results).to.have.length(1);
    expect(echo.results[0].objectType).to.equal(8841);
  });

  it('BLACKSMITH_REQUEST / DISMANTLE round-trip the captured dismantle', () => {
    const req = fromHex(new BlacksmithRequestPacket(), '010000024b0000000e00005cf2');
    expect(req.slots).to.have.length(1);
    expect(req.slots[0].objectId).to.equal(587);
    expect(req.slots[0].slotId).to.equal(14);
    expect(req.slots[0].objectType).to.equal(23794);
    roundTripsTo(req, '010000024b0000000e00005cf2');

    const res = fromHex(new BlacksmithDismantlePacket(), '01010000024b0000000effffffff');
    expect(res.success).to.equal(true);
    expect(res.slots[0].objectType).to.equal(-1); // dismantled -> empty
    roundTripsTo(res, '01010000024b0000000effffffff');
  });

  it('BLACKSMITH_REQUEST / DISMANTLE support multiple slots', () => {
    const requestHex = '03000002490000000400000253000002490000000700000253000002490000000500005195';
    const req = fromHex(new BlacksmithRequestPacket(), requestHex);
    expect(req.slots.map((slot) => slot.slotId)).to.deep.equal([4, 7, 5]);
    roundTripsTo(req, requestHex);

    const resultHex = '01030000024900000004ffffffff0000024900000007ffffffff0000024900000005ffffffff';
    const res = fromHex(new BlacksmithDismantlePacket(), resultHex);
    expect(res.success).to.equal(true);
    expect(res.slots.map((slot) => slot.slotId)).to.deep.equal([4, 7, 5]);
    expect(res.slots.every((slot) => slot.objectType === -1)).to.equal(true);
    roundTripsTo(res, resultHex);
  });
});
