import { expect } from 'chai';
import { RealmlibError, getPacketDefinitionById } from '../src';
import { loadCaptureCorpus, replayCaptureFixture } from './support/capture-fixtures';

describe('packet capture fixtures', () => {
  const corpus = loadCaptureCorpus();

  it('covers the protocol areas needed for offline client regression tests', () => {
    expect(
      Array.from(new Set(corpus.fixtures.map((fixture) => fixture.category))),
    ).to.include.members([
      'login',
      'reconnect',
      'queue',
      'movement',
      'combat',
      'inventory',
      'pets',
      'vault',
      'rewards',
      'enchanting',
      'party',
      'malformed',
    ]);
  });

  for (const fixture of corpus.fixtures) {
    it(`replays ${fixture.category}: ${fixture.name}`, () => {
      const definition = getPacketDefinitionById(fixture.id, fixture.direction);
      expect(definition?.type).to.equal(fixture.type);
      expect(definition?.direction).to.equal(fixture.direction);

      const replay = replayCaptureFixture(fixture);
      if (fixture.expectedError) {
        expect(replay.error).to.be.instanceOf(RealmlibError);
        expect((replay.error as RealmlibError).code).to.equal(fixture.expectedError);
        return;
      }

      expect(replay.error).to.equal(undefined);
      expect(replay.consumed).to.equal(Buffer.byteLength(fixture.body, 'hex'));
      if (fixture.roundTrip) {
        expect(replay.serializedBody).to.equal(fixture.body);
      }
    });
  }
});
