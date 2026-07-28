import { Packet } from '../packet';
import { RC4 } from '../crypto/rc4';
import { Writer } from '../writer';

/** Builds a plaintext RotMG frame for a typed packet. */
export function encodePacketFrame(packet: Packet, id: number, writer: Writer): Buffer {
  writer.index = 5;
  packet.write(writer);
  writer.writeHeader(id);
  return Buffer.from(writer.buffer.subarray(0, writer.index));
}

/** Builds a plaintext RotMG frame for an already serialized packet body. */
export function encodeRawFrame(id: number, body: Buffer): Buffer {
  const frame = Buffer.alloc(5 + body.length);
  frame.writeInt32BE(frame.length, 0);
  frame.writeUInt8(id, 4);
  body.copy(frame, 5);
  return frame;
}

/** Encrypts the body of a complete frame in place. */
export function encryptFrameBody(frame: Buffer, cipher: RC4): Buffer {
  cipher.cipher(frame.subarray(5));
  return frame;
}
