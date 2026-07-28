import { expect } from 'chai';
import {
  CheckCreditsPacket,
  createPacketMap,
  DEFAULT_PACKET_MAP,
  FrameTooLargeError,
  InvalidFrameLengthError,
  PACKET_REGISTRY,
  PacketType,
  RC4,
  Writer,
} from '../src';
import { FrameDecoder } from '../src/io/frame-decoder';
import { encodePacketFrame, encodeRawFrame, encryptFrameBody } from '../src/io/frame-encoder';
import { OutgoingQueue } from '../src/io/outgoing-queue';
import { PacketResolver } from '../src/io/packet-resolver';

describe('PacketIO components', () => {
  it('decodes fragmented and coalesced frames independently', () => {
    const first = encodeRawFrame(8, Buffer.from('0000002a', 'hex'));
    const second = encodeRawFrame(102, Buffer.alloc(0));
    const stream = Buffer.concat([first, second]);
    const decoder = new FrameDecoder(1024);

    expect(decoder.push(stream.subarray(0, 2))).to.deep.equal([]);
    expect(decoder.push(stream.subarray(2, 7))).to.deep.equal([]);
    expect(decoder.push(stream.subarray(7))).to.deep.equal([first, second]);
  });

  it('distinguishes undersized and oversized frame prefixes', () => {
    const decoder = new FrameDecoder(16);
    const short = Buffer.alloc(4);
    short.writeInt32BE(4);
    expect(() => decoder.push(short)).to.throw(InvalidFrameLengthError);

    const large = Buffer.alloc(4);
    large.writeInt32BE(17);
    expect(() => decoder.push(large)).to.throw(FrameTooLargeError);
  });

  it('encodes typed and raw frames before applying body encryption', () => {
    const typed = encodePacketFrame(new CheckCreditsPacket(), 102, new Writer());
    expect(typed.toString('hex')).to.equal('0000000566');

    const raw = encodeRawFrame(8, Buffer.from('0000002a', 'hex'));
    const plaintext = Buffer.from(raw);
    encryptFrameBody(raw, new RC4('01'));
    expect(raw.subarray(0, 5)).to.deep.equal(plaintext.subarray(0, 5));
    expect(raw.subarray(5)).not.to.deep.equal(plaintext.subarray(5));
  });

  it('bounds and clears the extracted outgoing FIFO', () => {
    const queue = new OutgoingQueue<number>(2);
    queue.push(1);
    queue.push(2);
    expect(queue.full).to.equal(true);
    expect(() => queue.push(3)).to.throw(RangeError);
    expect(queue.shift()).to.equal(1);
    expect(queue.clear()).to.equal(1);
    expect(queue.size).to.equal(0);
  });

  it('keeps direction collisions in the resolver', () => {
    const resolver = new PacketResolver(DEFAULT_PACKET_MAP, DEFAULT_PACKET_MAP);
    expect(resolver.typeFor(215, 'incoming')).to.equal(PacketType.PARTY_JOIN_RESULT);
    expect(resolver.typeFor(215, 'outgoing')).to.equal(PacketType.PARTY_JOIN_REQUEST);
  });
});

describe('canonical protocol export immutability', () => {
  it('freezes registry definitions and the default map', () => {
    expect(Object.isFrozen(PACKET_REGISTRY)).to.equal(true);
    expect(PACKET_REGISTRY.every(Object.isFrozen)).to.equal(true);
    expect(Object.isFrozen(DEFAULT_PACKET_MAP)).to.equal(true);
    expect(() => {
      (DEFAULT_PACKET_MAP as { [key: string]: unknown })[PacketType.PING] = 255;
    }).to.throw(TypeError);
  });

  it('provides an explicit mutable clone for custom mappings', () => {
    const custom = createPacketMap();
    custom[PacketType.PING] = 250;
    expect(custom[PacketType.PING]).to.equal(250);
    expect(DEFAULT_PACKET_MAP[PacketType.PING]).to.equal(8);
  });
});
