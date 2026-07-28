import { expect } from 'chai';
import { Reader, Writer, PacketReadError } from '../src';

/** A Reader whose `length` is exactly `bytes`, positioned at 0. */
function readerOf(bytes: number[]): Reader {
  const reader = new Reader(bytes.length);
  reader.resizeBuffer(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    reader.buffer[i] = bytes[i];
  }
  reader.index = 0;
  return reader;
}

describe('Reader bounds checking', () => {
  it('rejects negative collection counts before allocation', () => {
    const reader = new Reader(0);
    expect(() => reader.validateCollectionCount(-1, 4, 'items'))
      .to.throw(PacketReadError, 'invalid items count -1');
  });

  it('rejects collection counts that cannot fit in the packet', () => {
    const reader = new Reader(8);
    expect(() => reader.validateCollectionCount(3, 4, 'items'))
      .to.throw(PacketReadError, 'items count 3 cannot fit in 8 remaining byte(s)');
  });

  it('accepts collection counts that fit exactly', () => {
    const reader = new Reader(12);
    expect(reader.validateCollectionCount(3, 4, 'items')).to.equal(3);
  });

  it('throws PacketReadError when a fixed read runs past the end', () => {
    const reader = readerOf([0, 0]); // only 2 bytes, ask for 4
    expect(() => reader.readInt32()).to.throw(PacketReadError);
  });

  it('throws when a string length exceeds the remaining bytes', () => {
    // 2-byte length prefix says 100 bytes, but the packet has none left
    const reader = readerOf([0x00, 0x64]);
    expect(() => reader.readString()).to.throw(PacketReadError);
  });

  it('throws when a compressed int runs off the end (continuation bit set)', () => {
    // 0x80 sets the continuation bit but there is no next byte
    const reader = readerOf([0x80]);
    expect(() => reader.readCompressedInt()).to.throw(PacketReadError);
  });

  it('rejects overlong and non-canonical compressed integers', () => {
    const invalid = [
      [0x80, 0x00],
      [0x40],
      [0x80, 0x80, 0x80, 0x80, 0x80, 0x00],
      [0xff, 0xff, 0xff, 0xff, 0x7f],
    ];

    for (const bytes of invalid) {
      expect(() => readerOf(bytes).readCompressedInt(), Buffer.from(bytes).toString('hex'))
        .to.throw(PacketReadError);
    }
  });

  it('does not throw for reads that fit exactly', () => {
    const writer = new Writer();
    writer.writeInt32(1234);
    writer.writeString('hi');
    const reader = new Reader(writer.index);
    writer.buffer.copy(reader.buffer, 0, 0, writer.index);
    reader.index = 0;
    expect(reader.readInt32()).to.equal(1234);
    expect(reader.readString()).to.equal('hi');
    expect(reader.remaining).to.equal(0);
  });

  it('carries a machine-readable error code', () => {
    const reader = readerOf([0]);
    try {
      reader.readInt32();
      expect.fail('expected a throw');
    } catch (err) {
      expect((err as PacketReadError).code).to.equal('PACKET_READ_ERROR');
    }
  });
});
