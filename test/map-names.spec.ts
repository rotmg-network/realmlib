import { expect } from 'chai';
import { SAFE_MAP_NAMES, isSafeMapName } from '../src';

describe('safe map names', () => {
  it('exposes the established case-sensitive hub and storage names', () => {
    expect([...SAFE_MAP_NAMES]).to.deep.equal([
      'Nexus',
      'Vault',
      'Pet Yard',
      'Guild Hall',
      'Grand Bazaar',
    ]);
    expect(isSafeMapName('Nexus')).to.equal(true);
    expect(isSafeMapName('Realm of the Mad God')).to.equal(false);
    expect(isSafeMapName('nexus')).to.equal(false);
  });

  it('does not expose mutation methods at runtime', () => {
    expect(Object.isFrozen(SAFE_MAP_NAMES)).to.equal(true);
    expect('add' in SAFE_MAP_NAMES).to.equal(false);
    expect('delete' in SAFE_MAP_NAMES).to.equal(false);
    expect('clear' in SAFE_MAP_NAMES).to.equal(false);
  });
});
