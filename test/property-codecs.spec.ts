import { expect } from 'chai';
import { FrameDecoder, Reader, Writer, encodeRawFrame } from '../src';
import { readerFromBuffer } from './support/codec';

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state;
  };
}

describe('deterministic codec properties', () => {
  it('round-trips randomized fixed-width and compressed integers', () => {
    const random = createRandom(0x61200200);
    const values: Array<{
      int32: number;
      uint32: number;
      short: number;
      ushort: number;
      byte: number;
      ubyte: number;
      compressed: number;
    }> = [];
    const writer = new Writer();

    for (let index = 0; index < 2_000; index++) {
      const unsigned = random();
      const signed = unsigned | 0;
      const compressedMagnitude = unsigned & 0x7fffffff;
      const compressed = (random() & 1) === 0 ? compressedMagnitude : -compressedMagnitude;
      const value = {
        int32: signed,
        uint32: unsigned,
        short: (unsigned << 16) >> 16,
        ushort: unsigned & 0xffff,
        byte: (unsigned << 24) >> 24,
        ubyte: unsigned & 0xff,
        compressed,
      };
      values.push(value);
      writer.writeInt32(value.int32);
      writer.writeUInt32(value.uint32);
      writer.writeShort(value.short);
      writer.writeUnsignedShort(value.ushort);
      writer.writeByte(value.byte);
      writer.writeUnsignedByte(value.ubyte);
      writer.writeCompressedInt(value.compressed);
    }

    const reader = readerFromBuffer(writer.buffer.subarray(0, writer.index));
    for (const value of values) {
      expect(reader.readInt32()).to.equal(value.int32);
      expect(reader.readUInt32()).to.equal(value.uint32);
      expect(reader.readShort()).to.equal(value.short);
      expect(reader.readUnsignedShort()).to.equal(value.ushort);
      expect(reader.readByte()).to.equal(value.byte);
      expect(reader.readUnsignedByte()).to.equal(value.ubyte);
      expect(reader.readCompressedInt()).to.equal(value.compressed);
    }
    expect(reader.remaining).to.equal(0);
  });

  it('reassembles randomized frame sequences across arbitrary chunk boundaries', () => {
    const random = createRandom(0x215217);
    for (let trial = 0; trial < 100; trial++) {
      const expected = Array.from({ length: 1 + (random() % 12) }, (_, index) => {
        const body = Buffer.alloc(random() % 96);
        for (let offset = 0; offset < body.length; offset++) {
          body[offset] = random() & 0xff;
        }
        return encodeRawFrame((trial + index) & 0xff, body);
      });
      const stream = Buffer.concat(expected);
      const decoder = new FrameDecoder(1_024);
      const actual: Buffer[] = [];
      for (let offset = 0; offset < stream.length;) {
        const chunkLength = 1 + (random() % 31);
        actual.push(...decoder.push(stream.subarray(offset, offset + chunkLength)));
        offset += chunkLength;
      }
      expect(actual.map((frame) => frame.toString('hex'))).to.deep.equal(
        expected.map((frame) => frame.toString('hex')),
      );
    }
  });

  it('matches Node buffer encodings at integer boundary values', () => {
    const values = [-0x80000000, -0x8000, -0x80, -1, 0, 1, 0x7f, 0x7fff, 0x7fffffff];
    for (const value of values) {
      const writer = new Writer();
      writer.writeInt32(value);
      const expected = Buffer.alloc(4);
      expected.writeInt32BE(value);
      expect(writer.buffer.subarray(0, writer.index)).to.deep.equal(expected);

      const reader = new Reader(4);
      expected.copy(reader.buffer);
      expect(reader.readInt32()).to.equal(value);
    }
  });
});
