import { expect } from 'chai';
import { EMPTY_ENCHANTMENT, parseEnchantments } from '../src';

describe('parseEnchantments (ENCHANTMENTS_STAT)', () => {
  it('splits per slot and flags empty slots', () => {
    const value = `${EMPTY_ENCHANTMENT},AAIE4wF7BP3__f8=,,`;
    const slots = parseEnchantments(value);
    expect(slots).to.have.length(2); // trailing blanks skipped
    expect(slots[0].slot).to.equal(0);
    expect(slots[0].format).to.equal('equipment-v2');
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

  it('reads declared little-endian ids and does not consume suffix bytes', () => {
    const [slot] = parseEnchantments('AAIEzAQZAf3__f8FAA==');
    expect(slot.slotCount).to.equal(4);
    expect(slot.version).to.equal(2);
    expect(slot.enchantmentTypeIds).to.deep.equal([0x04cc, 0x0119]);
    expect([...slot.suffix]).to.deep.equal([5, 0]);

    const [empty] = parseEnchantments(EMPTY_ENCHANTMENT);
    expect(empty.enchantmentTypeIds).to.deep.equal([]);
    expect([...empty.suffix]).to.deep.equal([5, 0]);
  });

  it('preserves a pet/version-1 stat-80 blob without inventing enchantments', () => {
    // Captured on pet object type 32567 (name "Baby"), alongside pet stats
    // 81-85. Byte 2 is 0x53, not an equipment enchantment-slot count of 83.
    const [petBlob] = parseEnchantments('AAFTBE0AoQC3AAkA');
    expect(petBlob.format).to.equal('unknown');
    expect(petBlob.version).to.equal(1);
    expect([...petBlob.header]).to.deep.equal([0, 1, 0x53]);
    expect([...petBlob.bytes]).to.deep.equal([0, 1, 0x53, 4, 0x4d, 0, 0xa1, 0, 0xb7, 0, 9, 0]);
    expect(petBlob.slotCount).to.equal(undefined);
    expect(petBlob.enchantmentTypeIds).to.deep.equal([]);
    expect(petBlob.isEmpty).to.equal(undefined);
    expect([...petBlob.suffix]).to.deep.equal([]);
  });

  it('does not partially decode a truncated equipment blob', () => {
    // Header declares four uint16 slots, but only one complete slot follows.
    const [truncated] = parseEnchantments(Buffer.from([0, 2, 4, 1, 0]).toString('base64'));
    expect(truncated.format).to.equal('unknown');
    expect(truncated.enchantmentTypeIds).to.deep.equal([]);
    expect(truncated.slotCount).to.equal(undefined);
  });
});
