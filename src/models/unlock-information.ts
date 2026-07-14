/**
 * Known values carried by `UNLOCK_INFORMATION`.
 *
 * Only value 2 has a captured semantic assignment. Other values should remain
 * raw until a controlled capture identifies them.
 */
export enum UnlockInformationType {
  /** A vault slot/chest expansion was unlocked. */
  VAULT = 2,
}
