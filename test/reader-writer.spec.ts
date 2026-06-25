import { expect } from 'chai';
import { Reader } from '../src/reader';
import { Writer } from '../src/writer';

/** Builds a Reader positioned at 0 over the bytes a Writer has produced. */
function toReader(writer: Writer): Reader {
  const reader = new Reader(writer.index);
  writer.buffer.copy(reader.buffer, 0, 0, writer.index);
  reader.index = 0;
  return reader;
}

describe('Reader/Writer primitives', () => {
  it('round-trips fixed-width integers, booleans and floats', () => {
    const w = new Writer();
    w.writeInt32(-123456);
    w.writeUInt32(4000000000);
    w.writeShort(-12345);
    w.writeUnsignedShort(60000);
    w.writeByte(-120);
    w.writeUnsignedByte(250);
    w.writeBoolean(true);
    w.writeBoolean(false);
    w.writeFloat(3.5);

    const r = toReader(w);
    expect(r.readInt32()).to.equal(-123456);
    expect(r.readUInt32()).to.equal(4000000000);
    expect(r.readShort()).to.equal(-12345);
    expect(r.readUnsignedShort()).to.equal(60000);
    expect(r.readByte()).to.equal(-120);
    expect(r.readUnsignedByte()).to.equal(250);
    expect(r.readBoolean()).to.equal(true);
    expect(r.readBoolean()).to.equal(false);
    expect(r.readFloat()).to.equal(3.5);
  });

  it('writes packet ids as unsigned bytes in headers', () => {
    const w = new Writer();
    w.index = 5;
    w.writeHeader(200);

    expect(w.buffer.readInt32BE(0)).to.equal(5);
    expect(w.buffer.readUInt8(4)).to.equal(200);
  });
});

describe('compressed integers', () => {
  const values = [
    0, 1, 5, 63, 64, 127, 128, 8191, 16384, 1_000_000, 2_147_483_647,
    -1, -63, -64, -8192, -1_000_000, -2_147_483_647,
  ];
  for (const value of values) {
    it(`round-trips ${value}`, () => {
      const w = new Writer();
      w.writeCompressedInt(value);
      expect(toReader(w).readCompressedInt()).to.equal(value);
    });
  }
});

describe('strings', () => {
  it('round-trips ASCII', () => {
    const w = new Writer();
    w.writeString('hello world');
    expect(toReader(w).readString()).to.equal('hello world');
  });

  it('round-trips multi-byte UTF-8 without truncation', () => {
    const value = 'café® 世界 🐉';
    const w = new Writer();
    w.writeString(value);

    const r = toReader(w);
    // The length prefix must be the UTF-8 byte length, not the JS string length.
    expect(r.readUnsignedShort()).to.equal(Buffer.byteLength(value, 'utf8'));
    r.index = 0;
    expect(r.readString()).to.equal(value);
  });

  it('round-trips a UTF-32 length-prefixed string', () => {
    const value = 'a longer 世界 string';
    const w = new Writer();
    w.writeStringUTF32(value);
    expect(toReader(w).readStringUTF32()).to.equal(value);
  });
});

describe('byte arrays', () => {
  it('round-trips a byte array', () => {
    const bytes = [0, 1, 2, 128, 254, 255];
    const w = new Writer();
    w.writeByteArray(bytes);
    expect(toReader(w).readByteArray()).to.deep.equal(bytes);
  });
});
