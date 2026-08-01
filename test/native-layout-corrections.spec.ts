import { expect } from 'chai';
import {
  AcceleratorAddedPacket,
  ActivateCruciblePacket,
  ClaimDailyRewardResponse,
  ModeratorActionMessagePacket,
  PACKET_REGISTRY,
  PacketType,
  SetConditionPacket,
} from '../src';
import { parseHex, readerFromHex, writeHex } from './support/codec';

describe('exact current native packet layout corrections', () => {
  it('encodes SETCONDITION effect as uint32 before its float32 duration', () => {
    const packet = parseHex(new SetConditionPacket(), '800000003fc00000');
    expect(packet.conditionEffect).to.equal(0x80000000);
    expect(packet.conditionDuration).to.equal(1.5);

    packet.conditionEffect = 0xffffffff;
    expect(writeHex(packet)).to.equal('ffffffff3fc00000');
  });

  it('uses the single str16 LOGIN_REWARD_MSG field and resets deprecated state', () => {
    const packet = new ClaimDailyRewardResponse();
    packet.itemId = 1;
    packet.quantity = 2;
    packet.gold = 3;
    packet.read(readerFromHex('000772c3a977617264'));

    expect(packet.message).to.equal('réward');
    expect(packet.itemId).to.equal(0);
    expect(packet.quantity).to.equal(0);
    expect(packet.gold).to.equal(0);
    expect(writeHex(packet)).to.equal('000772c3a977617264');
  });

  it('encodes the complete MODERATOR_ACTION_MESSAGE layout at its boundaries', () => {
    const packet = parseHex(new ModeratorActionMessagePacket(), 'ff0003412c420002c3a98000');
    expect(packet).to.include({
      actionCode: 255,
      playerNames: 'A,B',
      reason: 'é',
      durationDays: -0x8000,
    });
    expect(packet.actionMessage).to.equal('é');

    packet.actionMessage = 'legacy reason';
    expect(packet.reason).to.equal('legacy reason');
    packet.actionCode = 0;
    packet.durationDays = 0x7fff;
    expect(writeHex(packet)).to.equal('000003412c42000d6c656761637920726561736f6e7fff');
  });

  it('models and registers the inherited three-int32 ACCELERATOR_ADDED body', () => {
    const packet = parseHex(new AcceleratorAddedPacket(), 'ffffffff0000000e80000000');
    expect(packet).to.include({
      value: -1,
      acceleratorType: 14,
      unknownInt: -0x80000000,
    });
    expect(writeHex(packet)).to.equal('ffffffff0000000e80000000');

    const definition = PACKET_REGISTRY.find(
      (entry) => entry.id === 179 && entry.direction === 'incoming',
    );
    expect(definition?.type).to.equal(PacketType.ACCELERATOR_ADDED);
    expect(definition?.factory?.()).to.be.instanceOf(AcceleratorAddedPacket);
  });

  it('keeps ACTIVATE_CRUCIBLE trailing bytes separate and preserves its signed alias', () => {
    const packet = parseHex(new ActivateCruciblePacket(), '00026964ff80');
    expect(packet).to.include({ crucibleId: 'id', activate: 255, crucibleType: 128 });
    expect(packet.trailing).to.equal(-128);
    expect(writeHex(packet)).to.equal('00026964ff80');

    packet.trailing = 0x0102;
    expect(packet.activate).to.equal(1);
    expect(packet.crucibleType).to.equal(2);
    expect(writeHex(packet)).to.equal('000269640102');
  });
});
