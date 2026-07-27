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
 * Category 2 is not "a pet pair" either: it carries the two title-slot ids and
 * mirrors the `RetitlePacket` sent immediately before it. The 19:40 session
 * settles this — `RETITLE 0000c89f00000fe3` is followed by
 * `FAVOUR_PET 02 0000c89f00000fe3`, the same two int32 verbatim. So packet 145
 * is a general favourite toggle whose first byte picks what is being favourited,
 * and the "trailing int32" is just the secondary title slot (0 when only one
 * title is equipped, as in the earlier `02 00009a0c 00000000` sample where
 * 0x9a0c = 39436 = `Title_Inagural_Champion`).
 */
export enum FavourPetOperation {
  /** One int32 pet instance id follows; -1 clears the favourite. */
  Pet = 0,
  /**
   * From client enum `ACMEACFBIGL` (Pet/Entrance/Title). No wire capture yet,
   * so the trailing int32 count is unconfirmed — the reader treats it as
   * unknown and keeps every complete trailing int32.
   */
  Entrance = 1,
  /** Two int32 title-slot ids follow (primary, secondary); mirrors RETITLE. */
  Title = 2
}

/** Result codes used when moving items to or from a pet container. */
export enum PetContainerTransferResult {
  Ok = 0,
  InvalidGeneric = 1,
  InvalidCantWithdrawFromPet = 2,
  InvalidCantPutOnPet = 3
}
