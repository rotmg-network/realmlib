/**
 * Parsing for the `ENCHANTMENTS_STAT` (stat 80) string value — the item
 * enchantment data.
 *
 * The stat value is a comma-separated list with one entry per equipment slot.
 * Each entry is a base64url-encoded blob that starts with the bytes
 * `00 02 04` (`AAIE...`) — an apparent version marker plus a max-slot count.
 * An unenchanted slot is the sentinel `AAIE_f_9__3__f8FAA==`. The exact
 * per-enchant id layout inside a populated blob is not yet fully decoded, so
 * this parser exposes the decoded bytes rather than guessing at ids.
 */

/** The base64url value of an equipment slot with no enchantments. */
export const EMPTY_ENCHANTMENT = 'AAIE_f_9__3__f8FAA==';

/** One equipment slot's parsed enchantment entry. */
export interface SlotEnchantments {
  /** Zero-based equipment slot index (position in the CSV). */
  slot: number;
  /** The raw base64url blob for this slot (may be empty string). */
  raw: string;
  /** The base64url-decoded bytes, or an empty buffer if `raw` is blank. */
  bytes: Buffer;
  /** Whether this slot has no enchantments (matches {@link EMPTY_ENCHANTMENT}). */
  isEmpty: boolean;
  /** Declared enchantment slot count from header byte 2. */
  slotCount: number;
  /** Non-empty uint16 little-endian enchantment type ids. */
  enchantmentTypeIds: number[];
  /** Bytes following the declared enchantment slots. */
  suffix: Buffer;
}

/** Decodes a single base64url blob (tolerating missing padding). */
function decodeBlob(raw: string): Buffer {
  if (!raw) {
    return Buffer.alloc(0);
  }
  const padded = raw.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64');
}

/**
 * Parses an `ENCHANTMENTS_STAT` string value into per-slot entries. Blank
 * entries (trailing empty CSV fields) are skipped. Returns [] for an empty or
 * missing value.
 */
export function parseEnchantments(value: string | undefined): SlotEnchantments[] {
  if (!value) {
    return [];
  }
  const result: SlotEnchantments[] = [];
  const parts = value.split(',');
  for (let slot = 0; slot < parts.length; slot++) {
    const raw = parts[slot];
    if (raw.length === 0) {
      continue; // trailing empty slots
    }
    const bytes = decodeBlob(raw);
    const slotCount = bytes.length >= 3 ? bytes[2] : 0;
    const enchantmentTypeIds: number[] = [];
    for (let offset = 3, i = 0; i < slotCount && offset + 1 < bytes.length; i++, offset += 2) {
      const id = bytes.readUInt16LE(offset);
      if (id !== 0xfffd) enchantmentTypeIds.push(id);
    }
    const suffixOffset = Math.min(bytes.length, 3 + slotCount * 2);
    result.push({
      slot,
      raw,
      bytes,
      isEmpty: enchantmentTypeIds.length === 0,
      slotCount,
      enchantmentTypeIds,
      suffix: bytes.subarray(suffixOffset),
    });
  }
  return result;
}
