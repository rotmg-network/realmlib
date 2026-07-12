import { expect } from 'chai';
import { EMPTY_ENCHANTMENT, parseEnchantments } from '../src';

describe('parseEnchantments (ENCHANTMENTS_STAT)', () => {
  it('splits per slot and flags empty slots', () => {
    const value = `${EMPTY_ENCHANTMENT},AAIE4wF7BP3__f8=,,`;
    const slots = parseEnchantments(value);
    expect(slots).to.have.length(2); // trailing blanks skipped
    expect(slots[0].slot).to.equal(0);
    expect(slots[0].isEmpty).to.equal(true);
    expect(slots[1].slot).to.equal(1);
    expect(slots[1].isEmpty).to.equal(false);
    // base64url decodes and starts with the 00 02 04 header.
    expect([...slots[1].bytes.subarray(0, 3)]).to.deep.equal([0, 2, 4]);
  });

  it('returns [] for empty/missing values', () => {
    expect(parseEnchantments(undefined)).to.deep.equal([]);
    expect(parseEnchantments('')).to.deep.equal([]);
  });
});
