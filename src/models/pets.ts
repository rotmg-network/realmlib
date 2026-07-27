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
  FusePet = 3,
  /** Expands the selected pet's backpack capacity. */
  PetBackpack = 4
}

/**
 * Observed layouts of the `FAVOUR_PET` request.
 *
 * The values are wire discriminators, not a pet-id count: operation 0 carries
 * one pet id, while operation 2 carries two.
 */
export enum FavourPetOperation {
  SinglePet = 0,
  PetPair = 2
}

/** Result codes used when moving items to or from a pet container. */
export enum PetContainerTransferResult {
  Ok = 0,
  InvalidGeneric = 1,
  InvalidCantWithdrawFromPet = 2,
  InvalidCantPutOnPet = 3
}
