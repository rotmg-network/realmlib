/** Character filters used by seasonal, Crucible, and Blood Ritual content. */
export enum CharacterFilter {
  None = 0,
  Seasonal = 1,
  NonSeasonal = 2,
  Crucible = 3,
  NonCrucible = 4,
  CrucibleSeasonal = 5,
  BloodRitual = 6,
  OutsideBloodRitual = 7
}

/** Boost kinds that can be attached to campaign or event definitions. */
export enum CampaignBoost {
  None = -1,
  BXP = 0,
  TieredLoot = 1,
  DropLoot = 2,
  XP = 3,
  Travel = 4,
  Caretaker = 5,
  Keymaster = 6,
  DungeonMaster = 7,
  Blacksmith = 8,
  DropDustChance = 9,
  DropDustVolume = 10,
  ItemSlotChance = 11,
  HP = 20,
  Damage = 21
}
