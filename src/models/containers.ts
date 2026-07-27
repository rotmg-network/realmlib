/**
 * Container types that items can be stored in
 */
export enum PanelType {
    None = 0,
    Map = 1,
    Equipment = 2,
    Inventory = 3,
    Backpack = 4,
    Quickslot = 5,
    VaultPanel = 6,
    PotionPanel = 7,
    ExtraBackpack = 8,
    Pet = 9,
    ForgeVaultPanel = 10
}

/**
 * The types of vault containers
 */
export enum VaultType {
    None = 0,
    Vault = 1,
    Gift = 2,
    Potions = 3,
    TemporaryGift = 4,
    Forge = 5
}

/**
 * Storage-expansion target, from client enum `LHEDNLBAILD` (build 6.12.0.2.0).
 * Candidate discriminator for the expand-storage flows; distinct from
 * `UnlockInformationType`.
 */
export enum ExpansionTarget {
  Vault = 0,
  SeasonalVault = 1,
  SeasonalPotion = 2,
  None = 3
}
