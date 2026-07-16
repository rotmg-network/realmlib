/**
 * Parsing for the `ENCHANTMENTS_STAT` (stat 80) string value — the item
 * enchantment data.
 *
 * On players, the stat value is a comma-separated list with one entry per
 * equipment slot. Confirmed equipment blobs start `00 02 <count>`, followed by
 * exactly `count` little-endian uint16 enchantment IDs. Stat 80 is overloaded:
 * pets can send a different `00 01 ...` blob, which must not be interpreted as
 * equipment enchantments. Every result therefore identifies its format and
 * always preserves the raw decoded bytes.
 */

/** The base64url value of an equipment slot with no enchantments. */
export const EMPTY_ENCHANTMENT = 'AAIE_f_9__3__f8FAA==';

/** Formats currently distinguished for a stat-80 blob. */
export type EnchantmentBlobFormat = 'equipment-v2' | 'unknown';

/** One equipment slot's parsed enchantment entry. */
export interface SlotEnchantments {
  /** Zero-based equipment slot index (position in the CSV). */
  slot: number;
  /** The non-blank raw base64url blob for this slot. */
  raw: string;
  /** The base64url-decoded bytes. */
  bytes: Buffer;
  /** First three decoded bytes, or the entire blob when shorter than three. */
  header: Buffer;
  /** Header byte 1 when present. Equipment enchantments currently use version 2. */
  version: number | undefined;
  /** Whether this is the confirmed equipment-enchantment format. */
  format: EnchantmentBlobFormat;
  /**
   * Whether a recognized equipment blob has no populated enchantments.
   * `undefined` means the blob format is unknown, not that the slot is enchanted.
   */
  isEmpty: boolean | undefined;
  /** Declared equipment enchantment-slot count, undefined for unknown formats. */
  slotCount: number | undefined;
  /** Non-empty uint16 little-endian enchantment type ids. */
  enchantmentTypeIds: number[];
  /** Bytes following declared slots; empty for unknown formats. */
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

/** Parses one non-blank CSV field while retaining its original slot index. */
function parseEnchantmentBlob(raw: string, slot: number): SlotEnchantments {
  const bytes = decodeBlob(raw);
  const version = bytes.length >= 2 ? bytes[1] : undefined;
  const declaredCount = bytes.length >= 3 ? bytes[2] : undefined;
  const requiredLength = declaredCount === undefined ? Infinity : 3 + declaredCount * 2;
  const recognized = bytes.length >= 3 && bytes[0] === 0 && version === 2 && bytes.length >= requiredLength;
  const slotCount = recognized ? declaredCount : undefined;
  const enchantmentTypeIds: number[] = [];
  if (recognized) {
    for (let offset = 3, i = 0; i < slotCount!; i++, offset += 2) {
      const id = bytes.readUInt16LE(offset);
      if (id !== 0xfffd) enchantmentTypeIds.push(id);
    }
  }
  const suffix = recognized ? bytes.subarray(requiredLength) : Buffer.alloc(0);
  return {
    slot,
    raw,
    bytes,
    header: bytes.subarray(0, Math.min(3, bytes.length)),
    version,
    format: recognized ? 'equipment-v2' : 'unknown',
    isEmpty: recognized ? enchantmentTypeIds.length === 0 : undefined,
    slotCount,
    enchantmentTypeIds,
    suffix,
  };
}

/**
 * Parses stat 80 without collapsing its comma-separated slot positions.
 * Blank fields are returned as `undefined`, so a caller may safely use the
 * result's array index as the equipment/inventory slot index. Returns [] for
 * an empty or missing value.
 */
export function parseEnchantmentSlots(
  value: string | undefined,
): Array<SlotEnchantments | undefined> {
  if (!value) {
    return [];
  }
  return value.split(',').map((raw, slot) => (
    raw.length > 0 ? parseEnchantmentBlob(raw, slot) : undefined
  ));
}

/**
 * Parses a stat-80 string into per-entry blobs. Blank CSV fields are skipped.
 * Only a complete `00 02 <count>` blob is decoded as equipment enchantments;
 * truncated, version-1 (pet), and otherwise unknown blobs retain their bytes
 * but return no enchantment IDs. Returns [] for an empty or missing value.
 */
export function parseEnchantments(value: string | undefined): SlotEnchantments[] {
  return parseEnchantmentSlots(value).filter(
    (entry): entry is SlotEnchantments => entry !== undefined,
  );
}
