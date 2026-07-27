/** Broad item categories used by current client filters. */
export enum ItemCategory {
  All = 0,
  Weapon = 1,
  Ability = 2,
  Armor = 3,
  Accessory = 4,
  Consumable = 5,
  Marks = 6,
  Pet = 7,
  Shiny = 8,
  Other = 9
}

/** Logical character storage areas used by inventory UI and transfers. */
export enum ContainerArea {
  Equipment = 0,
  Inventory = 1,
  Backpack = 2,
  BackpackExtension = 3,
  ForgeVault = 4
}
