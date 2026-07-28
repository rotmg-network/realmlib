import { expect } from 'chai';
import { PacketIO, PacketType, ShootAckPacket, UpdatePacket } from '../src';

describe('PacketIO concrete event typing', () => {
  it('accepts handlers declared against concrete packet classes', () => {
    const io = new PacketIO();
    const updateHandler = (_packet: UpdatePacket): void => undefined;
    const shootAckHandler = (_packet: ShootAckPacket): void => undefined;

    io.on(PacketType.UPDATE, updateHandler);
    io.once(PacketType.SHOOTACK, shootAckHandler);

    expect(io.listenerCount(PacketType.UPDATE)).to.equal(1);
    expect(io.listenerCount(PacketType.SHOOTACK)).to.equal(1);
  });

  it('defaults shoot acknowledgements to one acknowledged enemy shot', () => {
    expect(new ShootAckPacket().unknownShort).to.equal(1);
  });
});
