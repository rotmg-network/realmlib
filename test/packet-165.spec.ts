import { expect } from 'chai';
import { ProgressUpdatePacket, Reader, StatType, Writer } from '../src';

/** Builds a Reader over a UTF-16-length-prefixed string body. */
function stringBody(value: string): Reader {
  const w = new Writer();
  w.writeString(value);
  const reader = new Reader(w.index);
  w.buffer.copy(reader.buffer, 0, 0, w.index);
  reader.index = 0;
  return reader;
}

describe('ProgressUpdatePacket (prog/pool payloads)', () => {
  it('parses the captured prog/ payload (comma-delimited)', () => {
    const p = new ProgressUpdatePacket();
    p.read(stringBody('prog/51,1002,1'));
    expect(p.prefix).to.equal('prog');
    expect(p.entries).to.have.length(1);
    expect(p.entries[0].values).to.deep.equal([51, 1002, 1]);
  });

  it('parses the documented pool/ payload (colon-delimited, pipe entries)', () => {
    const p = new ProgressUpdatePacket();
    p.read(stringBody('pool/50:55:103:1782400780|50:56:203:1782400780|#'));
    expect(p.prefix).to.equal('pool');
    expect(p.entries).to.have.length(2);
    expect(p.entries[0].values).to.deep.equal([50, 55, 103, 1782400780]);
    expect(p.entries[1].values).to.deep.equal([50, 56, 203, 1782400780]);
  });

  it('round-trips the raw string exactly', () => {
    const p = new ProgressUpdatePacket();
    p.read(stringBody('prog/51,1002,1'));
    const w = new Writer();
    p.write(w);
    const echo = new ProgressUpdatePacket();
    echo.read(stringBody(p.value));
    expect(echo.value).to.equal('prog/51,1002,1');
  });
});

describe('newly mapped stat types (Oryx captures)', () => {
  it('names the animation, difficulty and timer stats', () => {
    expect(StatType.ANIMATION_STAT).to.equal(125);
    expect(StatType.ANIMATION_TIMESTAMP_STAT).to.equal(126);
    expect(StatType.UNKNOWN_73).to.equal(73);
    expect(StatType.DIFFICULTY_STAT).to.equal(122);
    // they must not collide with named neighbours
    expect(StatType[125]).to.equal('ANIMATION_STAT');
    expect(StatType[127]).to.equal('DUST_AMOUNT_STAT');
  });
});
