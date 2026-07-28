import { expect } from 'chai';
import { createPacket, DEFAULT_PACKET_MAP, PacketType, SetAbilityPacket } from '../src';
import { expectRoundTripsTo, readerFromHex } from './support/codec';

const CAPTURED_BODY = '0003056901442a14d54489ede2';

describe('SetAbilityPacket', () => {
  it('decodes and round trips the captured Exalt 6.12.0.2.0 Druid request', () => {
    const reader = readerFromHex(CAPTURED_BODY);
    const packet = new SetAbilityPacket();
    packet.read(reader);

    expect(packet.time).to.equal(197993);
    expect(packet.ability).to.equal(1);
    expect(packet.target.x).to.be.closeTo(680.3255005, 0.0001);
    expect(packet.target.y).to.be.closeTo(1103.433838, 0.0001);
    expect(reader.remaining).to.equal(0);

    expectRoundTripsTo(packet, CAPTURED_BODY);
  });

  it('is mapped and constructible through the packet factory', () => {
    expect(DEFAULT_PACKET_MAP[157]).to.equal(PacketType.SET_ABILITY);
    expect(createPacket(PacketType.SET_ABILITY)).to.be.instanceOf(SetAbilityPacket);
  });
});
