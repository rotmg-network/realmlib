/**
 * One grant encoded in an account-level reward result.
 *
 * The server serializes grants as comma-separated `kind:value` entries.
 * Item grants may append skin/texture data after a second colon.
 */
export interface AccountRewardGrant {
  /** The complete entry as it appeared on the wire. */
  raw: string;
  /** Grant discriminator, for example `item`, `fame`, or `boost_loot`. */
  kind: string;
  /** The portion after the first colon. */
  value: string;
  /** Item name for an `item` grant. */
  itemName?: string;
  /** Optional item skin/texture data, for example `336_272_-3_-3`. */
  skinData?: string;
  /** Numeric fame amount for a valid `fame` grant. */
  fame?: number;
}

/**
 * Parses the grant descriptor returned by packet 233.
 *
 * Unknown grant kinds are retained as `{ kind, value, raw }`, allowing newer
 * server reward types to pass through without losing information.
 */
export function parseAccountRewardGrants(description: string): AccountRewardGrant[] {
  if (!description) {
    return [];
  }

  return description.split(',').map((raw) => {
    const kindSeparator = raw.indexOf(':');
    if (kindSeparator === -1) {
      return { raw, kind: raw, value: '' };
    }

    const kind = raw.slice(0, kindSeparator);
    const value = raw.slice(kindSeparator + 1);
    const grant: AccountRewardGrant = { raw, kind, value };

    if (kind === 'item') {
      const skinSeparator = value.indexOf(':');
      grant.itemName = skinSeparator === -1 ? value : value.slice(0, skinSeparator);
      if (skinSeparator !== -1) {
        grant.skinData = value.slice(skinSeparator + 1);
      }
    } else if (kind === 'fame' && /^-?\d+$/.test(value)) {
      grant.fame = Number(value);
    }

    return grant;
  });
}
