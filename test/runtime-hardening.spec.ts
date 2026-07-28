import { expect } from 'chai';
import {
  ChatHelloPacket,
  HelloPacket,
  NotificationEffect,
  NotificationPacket,
  RC4,
  hexdump,
} from '../src';

describe('runtime input hardening', () => {
  it('rejects invalid hexdump row widths', () => {
    for (const width of [0, -1, 1.5, Number.NaN]) {
      expect(() => hexdump(Buffer.from([1]), width))
        .to.throw(RangeError, 'bytesPerRow must be a positive integer');
    }
  });

  it('matches a standard RC4 known-answer vector and reset epoch', () => {
    const cipher = new RC4(Buffer.from('Key', 'ascii'));
    const first = Buffer.from('Plaintext', 'ascii');
    cipher.cipher(first);
    expect(first.toString('hex')).to.equal('bbf316e8d940af0ad3');

    cipher.reset();
    const second = Buffer.from('Plaintext', 'ascii');
    cipher.cipher(second);
    expect(second.equals(first)).to.equal(true);
  });

  it('rejects empty and malformed RC4 keys', () => {
    expect(() => new RC4(Buffer.alloc(0))).to.throw(RangeError, 'must not be empty');
    expect(() => new RC4('')).to.throw(RangeError, 'must not be empty');
    expect(() => new RC4('abc')).to.throw(TypeError, 'even number of hexadecimal');
    expect(() => new RC4('zz')).to.throw(TypeError, 'hexadecimal');
  });

  it('copies caller-owned RC4 key buffers', () => {
    const key = Buffer.from('Key', 'ascii');
    const cipher = new RC4(key);
    key.fill(0);

    const data = Buffer.from('Plaintext', 'ascii');
    cipher.cipher(data);
    expect(data.toString('hex')).to.equal('bbf316e8d940af0ad3');
  });

  it('formats notification payloads without recursive interpolation', () => {
    const packet = new NotificationPacket();
    packet.effect = NotificationEffect.OBJECT;
    packet.extra = 3;
    packet.message = 'hello';
    packet.objectId = 42;
    packet.color = -1;

    expect(packet.toString()).to.equal(
      '[Notification] {"kind":"object","effect":6,"extra":3,' +
      '"message":"hello","objectId":42,"color":-1}',
    );
  });

  it('retains raw authentication tokens and reconnect keys in debug strings', () => {
    const hello = new HelloPacket();
    hello.accessToken = 'access-secret';
    hello.key = [1, 2, 3];
    hello.platformToken = 'platform-secret';
    hello.userToken = 'user-secret';
    hello.clientToken = 'client-secret';

    const helloText = hello.toString();
    for (const value of [
      'access-secret',
      '1,2,3',
      'platform-secret',
      'user-secret',
      'client-secret',
    ]) {
      expect(helloText).to.include(value);
    }

    const chat = new ChatHelloPacket();
    chat.token = 'chat-secret';
    expect(chat.toString()).to.include('chat-secret');
  });
});
