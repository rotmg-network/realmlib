import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  Packet,
  PacketDirection,
  PacketType,
  Reader,
  RealmlibErrorCode,
  Writer,
  createPacket,
} from '../../src';

export interface CaptureFixture {
  name: string;
  category: string;
  id: number;
  type: PacketType;
  direction: PacketDirection;
  body: string;
  roundTrip?: boolean;
  expectedError?: RealmlibErrorCode;
}

interface CaptureCorpus {
  version: number;
  description: string;
  fixtures: CaptureFixture[];
}

export interface CaptureReplay {
  fixture: CaptureFixture;
  packet?: Packet;
  consumed?: number;
  serializedBody?: string;
  error?: unknown;
}

const CORPUS_PATH = resolve(__dirname, '../fixtures/packet-captures.json');

/** Loads and minimally validates the committed packet capture corpus. */
export function loadCaptureCorpus(): CaptureCorpus {
  const corpus = JSON.parse(readFileSync(CORPUS_PATH, 'utf8')) as CaptureCorpus;
  if (corpus.version !== 1 || !Array.isArray(corpus.fixtures)) {
    throw new Error(`unsupported packet capture corpus at ${CORPUS_PATH}`);
  }
  return corpus;
}

/** Replays one packet body through the same reader, factory, and writer used by consumers. */
export function replayCaptureFixture(fixture: CaptureFixture): CaptureReplay {
  const packet = createPacket(fixture.type);
  if (!packet) {
    return { fixture, error: new Error(`no packet factory for ${fixture.type}`) };
  }

  const body = Buffer.from(fixture.body, 'hex');
  const reader = new Reader(body.length);
  body.copy(reader.buffer);

  try {
    packet.read(reader);
    let serializedBody: string | undefined;
    if (fixture.roundTrip) {
      const writer = new Writer();
      packet.write(writer);
      serializedBody = writer.buffer.subarray(0, writer.index).toString('hex');
    }
    return { fixture, packet, consumed: reader.index, serializedBody };
  } catch (error) {
    return { fixture, packet, consumed: reader.index, error };
  }
}
