/**
 * The account-id lists that {@link EditAccountListPacket} / `AccountListPacket`
 * operate on, selected by their `accountListId`.
 *
 * Confirmed from client behaviour (a capture where the player locked and
 * ignored the same players in turn): id 0 is the **lock** list and id 1 is the
 * **ignore** list.
 */
export enum AccountListType {
  /**
   * The lock list. Locked players are shown in the client and can be
   * unlocked. `accountListId = 0`.
   */
  Lock = 0,
  /**
   * The ignore list. Ignored players cannot chat or trade with you.
   * `accountListId = 1`.
   */
  Ignore = 1,
}
