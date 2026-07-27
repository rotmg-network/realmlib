/**
 * A list of the stat types which are used to describe an entity's attributes.
 * Values are for the current game build (6.12) and must match the live
 * protocol exactly, otherwise stat data is misread.
 */
export enum StatType {
  MAX_HP_STAT = 0,
  HP_STAT = 1,
  SIZE_STAT = 2,
  MAX_MP_STAT = 3,
  MP_STAT = 4,
  NEXT_LEVEL_EXP_STAT = 5,
  EXP_STAT = 6,
  LEVEL_STAT = 7,
  INVENTORY_0_STAT = 8,
  INVENTORY_1_STAT = 9,
  INVENTORY_2_STAT = 10,
  INVENTORY_3_STAT = 11,
  INVENTORY_4_STAT = 12,
  INVENTORY_5_STAT = 13,
  INVENTORY_6_STAT = 14,
  INVENTORY_7_STAT = 15,
  INVENTORY_8_STAT = 16,
  INVENTORY_9_STAT = 17,
  INVENTORY_10_STAT = 18,
  INVENTORY_11_STAT = 19,
  ATTACK_STAT = 20,
  DEFENSE_STAT = 21,
  SPEED_STAT = 22,
  SEASONAL_CHARACTER_STAT = 24,
  TEXTURE_STAT = 25,
  VITALITY_STAT = 26,
  WISDOM_STAT = 27,
  DEXTERITY_STAT = 28,
  CONDITION_STAT = 29,
  NUM_STARS_STAT = 30,
  NAME_STAT = 31,
  TEX1_STAT = 32,
  TEX2_STAT = 33,
  MERCHANDISE_TYPE_STAT = 34,
  CREDITS_STAT = 35,
  MERCHANDISE_PRICE_STAT = 36,
  ACTIVE_STAT = 37,
  ACCOUNT_ID_STAT = 38, // account id
  FAME_STAT = 39, // account fame
  MERCHANDISE_CURRENCY_STAT = 40,
  CONNECT_STAT = 41,
  MERCHANDISE_COUNT_STAT = 42,
  MERCHANDISE_MINS_LEFT_STAT = 43,
  MERCHANDISE_DISCOUNT_STAT = 44,
  MERCHANDISE_RANK_REQ_STAT = 45,
  MAX_HP_BOOST_STAT = 46,
  MAX_MP_BOOST_STAT = 47,
  ATTACK_BOOST_STAT = 48,
  DEFENSE_BOOST_STAT = 49,
  SPEED_BOOST_STAT = 50,
  VITALITY_BOOST_STAT = 51,
  WISDOM_BOOST_STAT = 52,
  DEXTERITY_BOOST_STAT = 53,
  OWNER_ACCOUNT_ID_STAT = 54,
  RANK_REQUIRED_STAT = 55,
  NAME_CHOSEN_STAT = 56,
  CURR_FAME_STAT = 57,
  NEXT_CLASS_QUEST_FAME_STAT = 58,
  LEGENDARY_RANK_STAT = 59,
  SINK_LEVEL_STAT = 60,
  /** Account-wide battle/account experience. */
  BXP_STAT = 61,
  GUILD_NAME_STAT = 62,
  GUILD_RANK_STAT = 63,
  BREATH_STAT = 64,
  XP_BOOSTED_STAT = 65,
  XP_TIMER_STAT = 66,
  LD_TIMER_STAT = 67,
  LT_TIMER_STAT = 68,
  HEALTH_POTION_STACK_STAT = 69,
  MAGIC_POTION_STACK_STAT = 70,
  MATERIAL_AMOUNT_STAT = 71,
  /** Unresolved numeric stat; observed values range from 700 to 1150. */
  UNKNOWN_74 = 74,
  MATERIAL_CAP_STAT = 72,
  HASBACKPACK_STAT = 79,
  /**
   * Base64url blob data. On players this is a comma-separated equipment
   * enchantment list using `00 02 <count>` blobs. Pets can carry a distinct
   * version-1 format in the same stat, so consumers must inspect the parsed
   * format before using enchantment IDs. See `parseEnchantments()`, or
   * `parseEnchantmentSlots()` when array positions must match inventory slots.
   */
  ENCHANTMENTS_STAT = 80,
  PET_INSTANCEID_STAT = 81,
  PET_NAME_STAT = 82,
  PET_TYPE_STAT = 83,
  PET_RARITY_STAT = 84,
  PET_MAXABILITYPOWER_STAT = 85,
  PET_FAMILY_STAT = 86,
  PET_FIRSTABILITY_POINT_STAT = 87,
  PET_SECONDABILITY_POINT_STAT = 88,
  PET_THIRDABILITY_POINT_STAT = 89,
  PET_FIRSTABILITY_POWER_STAT = 90,
  PET_SECONDABILITY_POWER_STAT = 91,
  PET_THIRDABILITY_POWER_STAT = 92,
  PET_FIRSTABILITY_TYPE_STAT = 93,
  PET_SECONDABILITY_TYPE_STAT = 94,
  PET_THIRDABILITY_TYPE_STAT = 95,
  /** Legacy stat retained for older captures; absent from current metadata. */
  NEW_CON_STAT = 96,
  FORTUNE_TOKEN_STAT = 97,
  SUPPORTER_POINTS_STAT = 98,
  SUPPORTER_STAT = 99,
  /** Legacy stat retained for older captures; absent from current metadata. */
  CHALLENGER_STARBG_STAT = 100,
  PROJECTILE_SPEED_MULT = 102,
  PLAYER_JOIN_TIME = 101, // server time the player joined the game 
  PROJECTILE_LIFE_MULT = 103,
  OPENED_AT_TIMESTAMP = 104,
  EXALTED_ATT = 105,
  EXALTED_DEF = 106,
  EXALTED_SPEED = 107,
  EXALTED_VIT = 108,
  EXALTED_WIS = 109,
  EXALTED_DEX = 110,
  EXALTED_HP = 111,
  EXALTED_MP = 112,
  EXALTATION_BONUS_DAMAGE = 113,
  // EXALTATION_IC_REDUCTION = 114,  // incorrect
  PET_OBJECT_ID = 114,
  GRAVE_ACCOUNT_ID = 115,
  POTION_ONE_TYPE = 116,
  POTION_TWO_TYPE = 117,
  POTION_THREE_TYPE = 118,
  POTION_BELT = 119,
  FORGEFIRE = 120,
  MODIFIERS_STAT = 121, // string stat: comma-separated modifier list (see isStringStat)
  OBJECT_IS_ACTIVE_STAT = 123,
  // String stat: the player's enchantment dust by tier, formatted
  // "tier:amount,tier:amount,..." e.g. "1:1876,2:0,3:0,4:80,5:1014".
  DUST_AMOUNT_STAT = 127,
  CRUCIBLE_STAT = 128,
  BACKPACK_0_STAT = 131,
  BACKPACK_1_STAT = 132,
  BACKPACK_2_STAT = 133,
  BACKPACK_3_STAT = 134,
  BACKPACK_4_STAT = 135,
  BACKPACK_5_STAT = 136,
  BACKPACK_6_STAT = 137,
  BACKPACK_7_STAT = 138,
  DUST_CAP_STAT = 147,
  /** @deprecated Use {@link PET_BACKPACK_SLOTS_STAT}. */
  UNKNOWN_148 = 148,
  /** Number of backpack slots currently unlocked for a pet. */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- compatibility alias
  PET_BACKPACK_SLOTS_STAT = 148,
  /** Current metadata defines this stat, but its payload semantics are unknown. */
  UNKNOWN_150 = 150,
  /** Current metadata defines this stat, but its payload semantics are unknown. */
  UNKNOWN_151 = 151,
  UNKNOWN_155 = 155,
  /** Unresolved numeric stat; observed values range from 0 to 10000. */
  UNKNOWN_158 = 158,

  // Resolved via RealmShark/ProdMafia. 125 varies over an object's lifetime
  // between a small set of recurring signed-int values; 126 is ~9.1M-9.8M and
  // climbs with spawn order — consistent with an animation state + timestamp.
  ANIMATION_STAT = 125,
  ANIMATION_TIMESTAMP_STAT = 126,
  // 122 observed 1500/6000/9500 on assorted objects (encounter difficulty).
  /** Unresolved numeric stat; observed as 600 or 800 on object type 29461. */
  UNKNOWN_73 = 73,
  DIFFICULTY_STAT = 122,

  // Resolved (RealmShark/ProdMafia). Values noted are from a level-1 seasonal
  // Rogue and a level-20 Wizard (cults capture).
  DISCOVERABLE_STAT = 23, // observed 1
  UNKNOWN_75 = 75, // observed 0
  POWER_LEVEL_STAT = 124, // observed 151
  SHADER_STAT = 129, // observed -1
  /** Number of normal player backpack slots, observed as 0 or 8. */
  BACKPACK_SLOTS_STAT = 130,
  // 139-146 sit right after BACKPACK_7 — a second (8-slot) backpack bank.
  BACKPACK_8_STAT = 139,
  BACKPACK_9_STAT = 140,
  BACKPACK_10_STAT = 141,
  BACKPACK_11_STAT = 142,
  BACKPACK_12_STAT = 143,
  BACKPACK_13_STAT = 144,
  BACKPACK_14_STAT = 145,
  BACKPACK_15_STAT = 146,
  /** Unresolved player stat, usually -1; one capture contained 2648. */
  UNKNOWN_149 = 149,
  ACCOUNT_LEVEL_STAT = 152,
  ACCOUNT_LEVEL_EXP_STAT = 153,
  UNKNOWN_154 = 154,
  UNKNOWN_156 = 156,
  UNKNOWN_157 = 157,
}

/** Character attributes used by mission and progression metadata. */
export enum CharacterStatAxis {
  None = -1,
  Attack = 0,
  Defense = 1,
  Speed = 2,
  Dexterity = 3,
  Vitality = 4,
  Wisdom = 5,
  MaxHp = 6,
  MaxMp = 7,
  SummonPower = 8
}

/**
 * The number of main inventory slots (equipment + inventory) carried in the
 * `INVENTORY_0..11` stats.
 */
export const INVENTORY_SLOT_COUNT = 12;
/**
 * The number of backpack slots carried in the `BACKPACK_0..7` stats.
 */
export const BACKPACK_SLOT_COUNT = 8;

/**
 * Whether `statType` carries an inventory or backpack slot's item id.
 */
export function isInventoryStat(statType: number): boolean {
  return inventorySlotIndex(statType) !== null;
}

/**
 * Maps an inventory-carrying stat type to a flat slot index:
 * `INVENTORY_0..11` -> 0..11, `BACKPACK_0..7` -> 12..19.
 * Returns `null` for any other stat type.
 */
export function inventorySlotIndex(statType: number): number | null {
  if (statType >= StatType.INVENTORY_0_STAT && statType <= StatType.INVENTORY_11_STAT) {
    return statType - StatType.INVENTORY_0_STAT;
  }
  if (statType >= StatType.BACKPACK_0_STAT && statType <= StatType.BACKPACK_7_STAT) {
    return INVENTORY_SLOT_COUNT + (statType - StatType.BACKPACK_0_STAT);
  }
  return null;
}

/**
 * Inverse of {@link inventorySlotIndex}: maps a flat slot index (0..19) back
 * to its stat type. Returns `null` for out-of-range indices.
 */
export function slotIndexToStatType(slotIndex: number): StatType | null {
  if (slotIndex >= 0 && slotIndex < INVENTORY_SLOT_COUNT) {
    return StatType.INVENTORY_0_STAT + slotIndex;
  }
  if (slotIndex >= INVENTORY_SLOT_COUNT && slotIndex < INVENTORY_SLOT_COUNT + BACKPACK_SLOT_COUNT) {
    return StatType.BACKPACK_0_STAT + (slotIndex - INVENTORY_SLOT_COUNT);
  }
  return null;
}
