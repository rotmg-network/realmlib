/**
 * The types of pet yards
 */
export enum PetYardType {
  /** No yard type has been received yet, or the server sent zero. */
  Unknown = 0,
  Common = 1,
  Uncommon = 2,
  Rare = 3,
  Legendary = 4,
  Divine = 5
}

/**
 * Command types that are used in ActivePetUpdateRequestPacket
 */
export enum ActivePetUpdateType {
  /** No pet command has been selected yet. */
  Unknown = 0,
  Follow = 1,
  Unfollow = 2,
  Release = 3
}

/**
 * Types which can be upgraded via PetUpgradeRequestPacket
 */
export enum PetUpgradeType {
  /** No upgrade operation has been selected yet. */
  Unknown = 0,
  PetYard = 1,
  FeedPet = 2,
  FusePet = 3
}
