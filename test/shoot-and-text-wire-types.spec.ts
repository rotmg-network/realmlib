import { expect } from 'chai';
import {
  AllyShootPacket,
  PlayerShootPacket,
  PlayerShootSource,
  Reader,
  TextPacket,
  Writer,
} from '../src';

function parseHex<T extends { read(reader: Reader): void }>(packet: T, hex: string): T {
  const body = Buffer.from(hex, 'hex');
  const reader = new Reader(body.length);
  body.copy(reader.buffer);
  reader.index = 0;
  packet.read(reader);
  expect(reader.remaining).to.equal(0);
  return packet;
}

function writeHex(packet: { write(writer: Writer): void }): string {
  const writer = new Writer();
  packet.write(writer);
  return writer.buffer.subarray(0, writer.index).toString('hex');
}

describe('capture-proven shoot and text wire types', () => {
  it('preserves a captured PlayerShoot burst byte and high-bit item type', () => {
    const captured = '0001b3210019a57400421a3f6342855e3f3e69f50d18ff00421910524285775c';
    const packet = parseHex(new PlayerShootPacket(), captured);

    expect(packet.containerType).to.equal(0xa574);
    expect(packet.burstByte).to.equal(24);
    expect(packet.isBurst).to.equal(true);
    expect(packet.burstByte).to.equal(24);
    expect(writeHex(packet)).to.equal(captured);
  });

  it('round trips the full PlayerShoot burst and unsigned-short boundaries', () => {
    for (const burstByte of [0, 1, 2, 24, 255]) {
      const packet = new PlayerShootPacket();
      packet.burstByte = burstByte;
      const decoded = parseHex(new PlayerShootPacket(), writeHex(packet));
      expect(decoded.burstByte).to.equal(burstByte);
      expect(decoded.isBurst).to.equal(burstByte !== 0);
    }

    for (const containerType of [0x7fff, 0x8000, 0xffff]) {
      const packet = new PlayerShootPacket();
      packet.containerType = containerType;
      const decoded = parseHex(new PlayerShootPacket(), writeHex(packet));
      expect(decoded.containerType).to.equal(containerType);
    }
  });

  it('keeps the deprecated PlayerShoot boolean setter explicitly lossy', () => {
    const packet = new PlayerShootPacket();
    packet.burstByte = 24;
    expect(packet.isBurst).to.equal(true);
    expect(packet.burstByte).to.equal(24);

    packet.isBurst = true;
    expect(packet.burstByte).to.equal(1);
    packet.isBurst = false;
    expect(packet.burstByte).to.equal(0);
  });

  it('splits a captured AllyShoot tail without appending an attack id', () => {
    const captured = '008100033fc3af74ffbfced17fff01';
    const packet = parseHex(new AllyShootPacket(), captured);

    expect(packet.containerType).to.equal(0xaf74);
    expect(packet.projectileId).to.equal(-1);
    expect(packet.unknownByte).to.equal(-1);
    expect(packet.unknownShotByte).to.equal(-1);
    expect(packet.shootSource).to.equal(PlayerShootSource.Ability);
    expect(packet.unknownShort).to.equal(-255);
    expect(writeHex(packet)).to.equal(captured);
  });

  it('round trips AllyShoot unsigned item types and packed compatibility view', () => {
    for (const containerType of [0x7fff, 0x8000, 0xffff]) {
      const packet = new AllyShootPacket();
      packet.containerType = containerType;
      packet.projectileId = -1;
      packet.unknownShotByte = 6;
      packet.shootSource = PlayerShootSource.Primary;
      const decoded = parseHex(new AllyShootPacket(), writeHex(packet));
      expect(decoded.containerType).to.equal(containerType);
      expect(decoded.projectileId).to.equal(-1);
      expect(decoded.unknownShotByte).to.equal(6);
      expect(decoded.shootSource).to.equal(PlayerShootSource.Primary);
      expect(decoded.unknownShort).to.equal(0x0600);
    }

    const compatibility = new AllyShootPacket();
    compatibility.unknownShort = -255;
    expect(compatibility.unknownShotByte).to.equal(-1);
    expect(compatibility.shootSource).to.equal(PlayerShootSource.Ability);
  });

  it('decodes and re-encodes the signed Text numStars sentinel', () => {
    const sentinel = '0000ffffffffffff000000000000000000000000';
    const packet = parseHex(new TextPacket(), sentinel);
    expect(packet.objectId).to.equal(-1);
    expect(packet.numStars).to.equal(-1);
    expect(writeHex(packet)).to.equal(sentinel);
  });

  it('round trips signed Text numStars boundaries', () => {
    for (const numStars of [-0x8000, -1, 0, 0x7fff]) {
      const packet = new TextPacket();
      packet.numStars = numStars;
      const decoded = parseHex(new TextPacket(), writeHex(packet));
      expect(decoded.numStars).to.equal(numStars);
    }
  });
});
