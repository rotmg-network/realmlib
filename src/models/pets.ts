/**
 * The types of pet yards
 */
export enum PetYardType {
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
  Follow = 1,
  Unfollow = 2,
  Release = 3
}

/**
 * Types which can be upgraded via PetUpgradeRequestPacket
 */
export enum PetUpgradeType {
  PetYard = 1,
  FeedPet = 2,
  FusePet = 3
}
