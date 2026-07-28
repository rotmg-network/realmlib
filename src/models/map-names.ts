/**
 * Case-sensitive `MapInfoPacket.name` values for non-combat hub/storage maps
 * where an auto-nexus safety action has no useful destination.
 *
 * This intentionally contains only names established by current clients and
 * consumers. Encounter maps and unresolved aliases must not be inferred safe.
 */
export const SAFE_MAP_NAMES: ReadonlySet<string> = createReadonlySet([
  'Nexus',
  'Vault',
  'Pet Yard',
  'Guild Hall',
  'Grand Bazaar',
]);

/** Returns whether a `MapInfoPacket.name` is a known non-combat safe map. */
export function isSafeMapName(name: string): boolean {
  return SAFE_MAP_NAMES.has(name);
}

function createReadonlySet(values: readonly string[]): ReadonlySet<string> {
  const set = new Set(values);
  const readonlySet: ReadonlySet<string> = {
    get size(): number {
      return set.size;
    },
    has(value: string): boolean {
      return set.has(value);
    },
    entries(): SetIterator<[string, string]> {
      return set.entries();
    },
    keys(): SetIterator<string> {
      return set.keys();
    },
    values(): SetIterator<string> {
      return set.values();
    },
    forEach(
      callback: (value: string, value2: string, owner: ReadonlySet<string>) => void,
      thisArg?: unknown,
    ): void {
      set.forEach((value) => callback.call(thisArg, value, value, readonlySet));
    },
    [Symbol.iterator](): SetIterator<string> {
      return set[Symbol.iterator]();
    },
  };
  return Object.freeze(readonlySet);
}
