import { expect } from 'chai';
import { Reader } from '../src/reader';
import { Writer } from '../src/writer';
import { GroundTileData, StatData, WorldPosData } from '../src/data';
import { StatType } from '../src/models';
import { UpdatePacket } from '../src/packets/incoming/update-packet';
import {
  createPacket,
  DEFAULT_PACKET_MAP,
  ForgeUnlockedBlueprints,
  PACKET_REGISTRY,
  PacketType,
  ProgressUpdatePacket,
} from '../src';

/** Builds a Reader positioned at 0 over the bytes a Writer has produced. */
function toReader(writer: Writer): Reader {
  const reader = new Reader(writer.index);
  writer.buffer.copy(reader.buffer, 0, 0, writer.index);
  reader.index = 0;
  return reader;
}

describe('StatData', () => {
  it('round-trips a numeric stat', () => {
    const stat = new StatData();
    stat.statType = StatType.LEVEL_STAT;
    stat.statValue = 47;
    stat.statValueTwo = 3;

    const w = new Writer();
    stat.write(w);

    const out = new StatData();
    out.read(toReader(w));
    expect(out.statType).to.equal(StatType.LEVEL_STAT);
    expect(out.statValue).to.equal(47);
    expect(out.statValueTwo).to.equal(3);
  });

  it('round-trips a multi-byte string stat', () => {
    const stat = new StatData();
    stat.statType = StatType.NAME_STAT;
    stat.stringStatValue = 'Wízärd 世';
    stat.statValueTwo = 0;

    const w = new Writer();
    stat.write(w);

    const out = new StatData();
    out.read(toReader(w));
    expect(out.statType).to.equal(StatType.NAME_STAT);
    expect(out.stringStatValue).to.equal('Wízärd 世');
  });
});

describe('UpdatePacket', () => {
  it('preserves pos and levelType through a write/read round trip', () => {
    const packet = new UpdatePacket();
    packet.pos = new WorldPosData(12.5, -7.25);
    packet.levelType = 4;
    const tile = new GroundTileData();
    tile.x = 10;
    tile.y = 20;
    tile.type = 300;
    packet.tiles = [tile];
    packet.drops = [1, 200000, -5];

    const w = new Writer();
    packet.write(w);

    const out = new UpdatePacket();
    out.read(toReader(w));

    expect(out.pos.x).to.equal(12.5);
    expect(out.pos.y).to.equal(-7.25);
    expect(out.levelType).to.equal(4);
    expect(out.tiles).to.have.length(1);
    expect(out.tiles[0].type).to.equal(300);
    expect(out.drops).to.deep.equal([1, 200000, -5]);
  });
});

describe('packet factory coverage', () => {
  it('derives unique ids, mappings, and factories from one registry', () => {
    const wireKeys = PACKET_REGISTRY
      .filter((definition) => definition.id !== undefined)
      .map((definition) => `${definition.direction}:${definition.id}`);
    const types = PACKET_REGISTRY.map((definition) => definition.type);
    expect(new Set(wireKeys).size).to.equal(wireKeys.length);
    expect(new Set(types).size).to.equal(types.length);

    for (const definition of PACKET_REGISTRY) {
      // Wire ids are a single byte, so DEFAULT_PACKET_MAP deliberately excludes
      // anything outside 0-255. The registry still carries such ids for
      // research (IP_ADDRESS 1000 is a legacy entry that cannot be a wire id in
      // this build), so they must be skipped rather than asserted on.
      if (definition.id !== undefined && definition.id >= 0 && definition.id <= 255) {
        expect(DEFAULT_PACKET_MAP[definition.type]).to.equal(definition.id);
        if (definition.direction === 'incoming') {
          expect(DEFAULT_PACKET_MAP[definition.id]).to.equal(definition.type);
        }
      }
      if (definition.factory) {
        expect(createPacket(definition.type).type).to.equal(definition.type);
      }
    }
  });

  it('constructs the seasonal conversion packet', () => {
    expect(createPacket(PacketType.CONVERT_SEASONAL_CHARACTER).type).to.equal(PacketType.CONVERT_SEASONAL_CHARACTER);
  });

  it('constructs the chat hello packet', () => {
    expect(createPacket(PacketType.CHATHELLO).type).to.equal(PacketType.CHATHELLO);
  });

  it('constructs mapped but previously unhandled incoming packets', () => {
    expect(createPacket(PacketType.FORGE_UNLOCKED_BLUEPRINTS).type).to.equal(PacketType.FORGE_UNLOCKED_BLUEPRINTS);
    expect(createPacket(PacketType.PROGRESS_UPDATE).type).to.equal(PacketType.PROGRESS_UPDATE);
    expect(createPacket(PacketType.UNLOCK_INFORMATION).type).to.equal(PacketType.UNLOCK_INFORMATION);
  });

  it('constructs all captured reward claim packets', () => {
    expect(createPacket(PacketType.CLAIM_ACCOUNT_LEVEL_REWARD).type).to.equal(PacketType.CLAIM_ACCOUNT_LEVEL_REWARD);
    expect(createPacket(PacketType.CLAIM_ACCOUNT_LEVEL_REWARD_RESULT).type).to.equal(PacketType.CLAIM_ACCOUNT_LEVEL_REWARD_RESULT);
    expect(createPacket(PacketType.CLAIM_REWARD).type).to.equal(PacketType.CLAIM_REWARD);
    expect(createPacket(PacketType.CLAIM_REWARD_RESULT).type).to.equal(PacketType.CLAIM_REWARD_RESULT);
  });
});

describe('captured modern packet payloads', () => {
  it('parses ForgeUnlockedBlueprints payload 0100', () => {
    const reader = new Reader(2);
    Buffer.from('0100', 'hex').copy(reader.buffer);
    const packet = new ForgeUnlockedBlueprints();
    packet.read(reader);
    expect(packet.unknownByte).to.equal(1);
    expect(packet.unlockedBlueprints).to.deep.equal([]);
  });

  it('parses PROGRESS_UPDATE as pool string entries', () => {
    const reader = new Reader(50);
    Buffer.from('0030706f6f6c2f35303a35353a3130333a313738323430303738307c35303a35363a3230333a313738323430303738307c23', 'hex').copy(reader.buffer);
    const packet = new ProgressUpdatePacket();
    packet.read(reader);
    expect(packet.value).to.equal('pool/50:55:103:1782400780|50:56:203:1782400780|#');
    expect(packet.prefix).to.equal('pool');
    expect(packet.entries).to.deep.equal([
      { raw: '50:55:103:1782400780', values: [50, 55, 103, 1782400780] },
      { raw: '50:56:203:1782400780', values: [50, 56, 203, 1782400780] },
    ]);
  });
});
