import { expect } from 'chai';
import { PacketType } from '../src';

/* eslint-disable @typescript-eslint/no-require-imports -- analyzer is a CommonJS CLI module */
const {
  parseCurrent,
  recordDirection,
}: {
  parseCurrent(record: { id: number; dir?: string; body?: string }): {
    status: string;
    type: string;
    packet?: { type: PacketType };
    error?: string;
    opaqueBytes?: number;
  };
  recordDirection(value: string): 'incoming' | 'outgoing' | undefined;
} = require('../scripts/analyze-log-corpus.cjs');

describe('log corpus analyzer packet directions', () => {
  const fixtures = [
    {
      dir: 'S->C',
      id: 215,
      body: '0000002a01',
      type: PacketType.PARTY_JOIN_RESULT,
    },
    {
      dir: 'C->S',
      id: 215,
      body: '0000002a',
      type: PacketType.PARTY_JOIN_REQUEST,
    },
    {
      dir: 'S->C',
      id: 217,
      body: '0001410300010002',
      type: PacketType.PARTY_REQUEST_RESPONSE,
    },
    {
      dir: 'C->S',
      id: 217,
      body: '0001410300010002',
      type: PacketType.PARTY_JOIN_REQUEST_RESPONSE,
    },
  ];

  for (const fixture of fixtures) {
    it(`parses ${fixture.dir} id ${fixture.id} as ${fixture.type}`, () => {
      const result = parseCurrent(fixture);

      expect(result.status).to.equal('ok');
      expect(result.type).to.equal(fixture.type);
      expect(result.packet?.type).to.equal(fixture.type);
    });
  }

  it('accepts normalized direction names', () => {
    expect(recordDirection('incoming')).to.equal('incoming');
    expect(recordDirection('outgoing')).to.equal('outgoing');
  });

  it('rejects records whose direction is absent or unknown', () => {
    const result = parseCurrent({ id: 215, dir: 'sideways', body: '' });

    expect(result.status).to.equal('invalid-direction');
    expect(result.error).to.equal('Unknown packet direction: sideways');
  });

  it('reports preserved vault tails as opaque rather than fully decoded', () => {
    const packet = new (require('../src').VaultContentPacket)();
    packet.opaqueTail = Buffer.from([0x80, 0xff]);
    const writer = new (require('../src').Writer)();
    packet.write(writer);
    const result = parseCurrent({
      id: 117,
      dir: 'S->C',
      body: writer.buffer.subarray(0, writer.index).toString('hex'),
    });

    expect(result.status).to.equal('opaque');
    expect(result.opaqueBytes).to.equal(2);
  });
});
