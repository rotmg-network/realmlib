/**
 *  //   "assembly": "Assembly-CSharp",
    //   "name": "INDFJNIFFKP",
 */
export enum EnchantType {
  None = -1,
  EnchancedSpeed = 1,
  EnchancedProjectilesToReplace = 2,
  EnchancedMinDamage = 3,
  EnchancedMaxDamage = 4,
  EnchancedRateOfFire = 5,
  EnchancedNumProjectiles = 6,
  EnchancedProjectileLifetime = 7,
  EnchancedProjectileSize = 8,
  EnchancedProjectilePassesCover = 9,
  EnchancedProjectileArmorPiercing = 10,
  EnchancedSubAttackToReplace = 11,
  EnchancedSubAttackToAdd = 12,
  EnchancedUI = 13,
  EnchancedMPCost = 14,
  EnchancedProjectileBoomerang = 15,
  EnchancedProjectilRemoveBoomerang = 16,
  EnchancedProjectileArcGap = 17,
  EnchancedXPBonus = 25,
  EnchancedLootBonus = 26,
  EnchancedDustBonus = 27,
}

/**
 * Enchantment operation kinds, from client enum `AAMIPLLCFNK`
 * (Assembly-CSharp, build 6.12.0.2.0). A zero-based variant `KIIOCLPGIAN`
 * (Upgrade = 0, Downgrade = 1, Reroll = 2) also exists in the client.
 */
export enum EnchantmentOperation {
  Upgrade = 1,
  Downgrade = 2,
  Reroll = 3,
  Wipe = 4,
}

/**
 * Currency used to pay for an enchant operation, from client enum
 * `MJMJAFIKFCI` (build 6.12.0.2.0).
 */
export enum EnchantCurrency {
  Dust = 0,
  Gold = 1,
}
