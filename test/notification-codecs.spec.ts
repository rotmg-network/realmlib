import { expect } from 'chai';
import {
  NotificationEffect,
  NotificationPacket,
  Writer,
} from '../src';
import { readerFromBuffer } from './support/codec';

describe('notification effect codecs', () => {
  it('preserves unsupported effect bodies byte-exactly', () => {
    const body = Buffer.from('2a01deadbeef', 'hex');
    const packet = new NotificationPacket();
    const reader = readerFromBuffer(body);
    packet.read(reader);

    expect(reader.remaining).to.equal(0);
    expect(packet.payload).to.deep.equal({
      kind: 'unknown',
      effect: 42,
      extra: 1,
      rawPayload: Buffer.from('deadbeef', 'hex'),
    });

    const writer = new Writer();
    packet.write(writer);
    expect(writer.buffer.subarray(0, writer.index)).to.deep.equal(body);
  });

  it('resets inactive fields when an instance is reused', () => {
    const packet = new NotificationPacket();
    packet.read(readerFromBuffer(Buffer.from('06000001780000000700000009', 'hex')));
    expect(packet.message).to.equal('x');
    expect(packet.color).to.equal(9);

    packet.read(readerFromBuffer(Buffer.from('05000000002a0003', 'hex')));
    expect(packet.effect).to.equal(NotificationEffect.REALM_QUEUE);
    expect(packet.objectId).to.equal(42);
    expect(packet.queuePos).to.equal(3);
    expect(packet.message).to.equal('');
    expect(packet.color).to.equal(0);
    expect(packet.unknownPayload).to.deep.equal(Buffer.alloc(0));
  });

  it('keeps current metadata-only zero-body effects empty', () => {
    const packet = new NotificationPacket();
    packet.effect = NotificationEffect.VICTORY;
    packet.extra = 0;
    packet.unknownPayload = Buffer.from('ffff', 'hex');
    const writer = new Writer();
    packet.write(writer);
    expect(writer.buffer.subarray(0, writer.index).toString('hex')).to.equal('0e00');
  });
});
