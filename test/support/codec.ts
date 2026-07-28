import { expect } from 'chai';
import { Reader, Writer } from '../../src';

export interface ReadableCodec {
  read(reader: Reader): void;
}

export interface WritableCodec {
  write(writer: Writer): void;
}

export type RoundTripCodec = ReadableCodec & WritableCodec;

export function readerFromBuffer(body: Buffer): Reader {
  const reader = new Reader(body.length);
  body.copy(reader.buffer);
  return reader;
}

export function readerFromHex(hex: string): Reader {
  return readerFromBuffer(Buffer.from(hex, 'hex'));
}

export function parseHex<T extends ReadableCodec>(value: T, hex: string): T {
  const reader = readerFromHex(hex);
  value.read(reader);
  expect(reader.remaining, 'no leftover bytes').to.equal(0);
  return value;
}

export function writeBuffer(value: WritableCodec): Buffer {
  const writer = new Writer();
  value.write(writer);
  return Buffer.from(writer.buffer.subarray(0, writer.index));
}

export function writeHex(value: WritableCodec): string {
  return writeBuffer(value).toString('hex');
}

export function expectRoundTripsTo(value: WritableCodec, hex: string): void {
  expect(writeHex(value)).to.equal(hex);
}

export function roundTrip<T extends RoundTripCodec>(value: WritableCodec, fresh: T): T {
  const reader = readerFromBuffer(writeBuffer(value));
  fresh.read(reader);
  expect(reader.remaining, 'no leftover bytes after round-trip').to.equal(0);
  return fresh;
}
