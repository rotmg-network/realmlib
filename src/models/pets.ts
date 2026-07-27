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
 * Category discriminator of the `FAVOUR_PET` request.
 *
 * Not a pet-id count. The 2026-07-27 capture settles it against the account
 * service: the client sent `00 00000055` and `/char/list` came back with
 * `<FavoritePet>85</FavoritePet>`, and 0x55 is 85. Read as a count that body
 * declares zero pets, which cannot be what set pet 85.
 *
 * Category 2 is not "a pet pair" either. Its only sample is
 * `02 00009a0c 00000000`, sent one packet after a `RetitlePacket`, and 0x9a0c
 * is 39436 = `Title_Inagural_Champion` in the game's objects.xml. So packet 145
 * is a general favourite toggle whose first byte picks what is being favourited,
 * and the trailing int32 of the title form is 0 and unexplained.
 */
export enum FavourPetOperation {
  /** One int32 pet instance id follows; -1 clears the favourite. */
  Pet = 0,
  /** One int32 title item type follows, then a trailing int32 (observed 0). */
  Title = 2
}

/** Result codes used when moving items to or from a pet container. */
export enum PetContainerTransferResult {
  Ok = 0,
  InvalidGeneric = 1,
  InvalidCantWithdrawFromPet = 2,
  InvalidCantPutOnPet = 3
}
