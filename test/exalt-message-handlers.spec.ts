import { expect } from 'chai';
import {
  BuyRefinementPacket,
  createPacket,
  ForReconnectPacket,
  GiftInfo,
  GiftNotificationPacket,
  LoadingScreenPacket,
  PacketType,
  RefineResultPacket,
  RefinementAction,
  SaveLockUpdatePacket,
  SlotObjectData,
} from '../src';
import { parseHex, readerFromHex, roundTrip, writeHex } from './support/codec';

describe('Exalt 6.12 message-catalog handlers', () => {
  it('decodes unsuccessful REFINE_RESULT without success-only fields', () => {
    const packet = parseHex(new RefineResultPacket(), '00');

    expect(packet.success).to.equal(false);
    expect(packet.uniqueData).to.equal('');
  });

  it('round trips successful REFINE_RESULT with lossless unique data', () => {
    const packet = new RefineResultPacket();
    packet.success = true;
    packet.slotObject = SlotObjectData.from(7, 3, -1);
    packet.uniqueData = 'opaque unique data';

    const decoded = roundTrip(packet, new RefineResultPacket());
    expect(decoded.success).to.equal(true);
    expect(decoded.slotObject.equals(packet.slotObject)).to.equal(true);
    expect(decoded.uniqueData).to.equal('opaque unique data');
    expect(decoded.mods).to.equal('');
  });

  it('uses byte framing for BUY_REFINEMENT modifier indexes', () => {
    const packet = new BuyRefinementPacket();
    packet.slotObject = SlotObjectData.from(1, 2, -1);
    packet.action = RefinementAction.Reroll;
    packet.modifierIndices = [1, 255];

    expect(writeHex(packet)).to.equal('0000000100000002ffffffff00030201ff');
    const decoded = roundTrip(packet, new BuyRefinementPacket());
    expect(decoded.action).to.equal(RefinementAction.Reroll);
    expect(decoded.modifierIndices).to.deep.equal([1, 255]);
  });

  it('preserves the leading-colon FOR_RECONNECT representation', () => {
    const packet = parseHex(new ForReconnectPacket(), '000f3a5573536f7574683a457557657374');

    expect(packet.encodedServerNames).to.equal(':UsSouth:EuWest');
    expect(packet.serverNames).to.deep.equal(['UsSouth', 'EuWest']);
    expect(writeHex(packet)).to.equal('000f3a5573536f7574683a457557657374');
  });

  it('writes edited FOR_RECONNECT names as one delimited string', () => {
    const packet = new ForReconnectPacket();
    packet.serverNames = ['USWest', 'EUEast'];

    expect(writeHex(packet)).to.equal('000d5553576573743a455545617374');
  });

  it('decodes GIFT_NOTIFICATION JSON while preserving its raw string', () => {
    const info: GiftInfo = {
      type: 'item',
      area: 2,
      text: 'Enjoy',
      items: [100, 200],
      from: { accountId: 10, name: 'Sender' },
      to: { accountId: 20, name: 'Receiver' },
      createdAt: 1_722_222_222_222,
    };
    const packet = new GiftNotificationPacket();
    packet.unknownInt = 7;
    packet.giftInfo = info;

    const decoded = roundTrip(packet, new GiftNotificationPacket());
    expect(decoded.unknownInt).to.equal(7);
    expect(decoded.giftInfo).to.deep.equal(info);
    expect(decoded.giftInfoJson).to.equal(JSON.stringify(info));
  });

  it('retains unrecognized GIFT_NOTIFICATION JSON without failing', () => {
    const reader = readerFromHex('0000002a00017b');
    const packet = new GiftNotificationPacket();
    packet.read(reader);

    expect(packet.unknownInt).to.equal(42);
    expect(packet.giftInfoJson).to.equal('{');
    expect(packet.giftInfo).to.equal(null);
    expect(writeHex(packet)).to.equal('0000002a00017b');
  });

  it('uses SaveLockUpdateMessage as packet 222 and keeps legacy aliases', () => {
    const current = createPacket(PacketType.SAVE_LOCK_UPDATE);
    const legacy = createPacket(PacketType.LOADING_SCREEN);

    expect(current).to.be.instanceOf(SaveLockUpdatePacket);
    expect(legacy).to.be.instanceOf(SaveLockUpdatePacket);
    expect(new LoadingScreenPacket()).to.be.instanceOf(SaveLockUpdatePacket);

    const decoded = parseHex(new SaveLockUpdatePacket(), '01');
    expect(decoded.saveLock).to.equal(true);
    expect(decoded.unknownBool).to.equal(true);
  });
});
