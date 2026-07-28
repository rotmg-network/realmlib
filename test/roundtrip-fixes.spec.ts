import { expect } from 'chai';
import { PicPacket, ShowEffectPacket, Writer } from '../src';
import { roundTrip } from './support/codec';

describe('read/write round-trip fixes', () => {
  it('PicPacket round-trips its raw (unprefixed) bitmap bytes', () => {
    // Regression: write() used writeByteArray (2-byte length prefix) while
    // read() uses readBytes(width*height*4) with no prefix.
    const pic = new PicPacket();
    pic.width = 2;
    pic.height = 1;
    pic.bitmapData = [0, 64, 128, 255, 10, 20, 30, 200]; // 2*1*4 bytes
    const back = roundTrip(pic, new PicPacket());
    expect(back.width).to.equal(2);
    expect(back.height).to.equal(1);
    expect(back.bitmapData).to.deep.equal(pic.bitmapData);
  });

  it('PicPacket rejects invalid dimensions and bitmap lengths before writing', () => {
    const packet = new PicPacket();
    const writer = new Writer();

    expect(() => packet.write(writer)).to.throw(RangeError, 'positive integers');

    packet.width = 1;
    packet.height = 1;
    packet.bitmapData = [0, 1, 2];
    expect(() => packet.write(new Writer())).to.throw(RangeError, 'RGBA length 4');

    packet.height = 1.5;
    packet.bitmapData = [];
    expect(() => packet.write(new Writer())).to.throw(RangeError, 'positive integers');
  });

  it('ShowEffectPacket round-trips with a partial presence bitmask', () => {
    // Regression: write() never emitted the presence bitmask and wrote every
    // field unconditionally, so a re-encoded packet could not be read back.
    const fx = new ShowEffectPacket();
    fx.effectType = 7;
    fx.flags = 1 | 2 | 4 | 32; // color + pos1.x + pos1.y + duration present
    fx.color = 0x00ff00ff;
    fx.pos1.x = 12.5;
    fx.pos1.y = -3.25;
    fx.duration = 2.5;
    const back = roundTrip(fx, new ShowEffectPacket());
    expect(back.effectType).to.equal(7);
    expect(back.flags).to.equal(1 | 2 | 4 | 32);
    expect(back.color).to.equal(0x00ff00ff);
    expect(back.pos1.x).to.equal(12.5);
    expect(back.pos1.y).to.equal(-3.25);
    expect(back.duration).to.equal(2.5);
    // Absent fields fall back to the read() sentinels.
    expect(back.targetObjectId).to.equal(0);
    expect(back.pos2.x).to.equal(0);
  });

  it('ShowEffectPacket round-trips an empty bitmask (all fields absent)', () => {
    const fx = new ShowEffectPacket();
    fx.effectType = 3;
    fx.flags = 0;
    const back = roundTrip(fx, new ShowEffectPacket());
    expect(back.effectType).to.equal(3);
    expect(back.flags).to.equal(0);
    expect(back.color).to.equal(-1); // signed int32 all-bits-set sentinel
    expect(back.duration).to.equal(1); // sentinel from read()
  });

  it('ShowEffectPacket can serialize its absent-color sentinel after enabling color', () => {
    const fx = new ShowEffectPacket();
    fx.effectType = 3;
    fx.flags = 0;
    const back = roundTrip(fx, new ShowEffectPacket());

    back.flags |= 1;
    const withColor = roundTrip(back, new ShowEffectPacket());
    expect(withColor.flags & 1).to.equal(1);
    expect(withColor.color).to.equal(-1);
  });

  it('ShowEffectPacket decodes the size flag', () => {
    const fx = new ShowEffectPacket();
    fx.effectType = 35;
    fx.flags = 128;
    fx.size = 75;
    const back = roundTrip(fx, new ShowEffectPacket());
    expect(back.size).to.equal(75);
  });
});
