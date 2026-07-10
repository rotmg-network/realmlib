/**
 * Object types of non-class entities observed in captured sessions. Class
 * object types live in {@link Classes}; this enum collects containers and
 * other interactable objects that realmlib has verified against real traffic.
 */
export enum ObjectType {
  /**
   * The single-slot container spawned next to the player in the Nexus and
   * Pet Yard during the seasonal-conversion flow. Carries no gear or pet
   * stats (HP 0, size 60) and only ever exposes `INVENTORY_0`, which holds
   * the seasonal-conversion token (item 2991). The client swaps the token
   * out of this container into the player's inventory immediately after
   * sending `CONVERT_SEASONAL_CHARACTER`; the server then removes the token
   * from the player with a server-initiated `INVRESULT` push.
   */
  SeasonalConversionContainer = 32545,
}
