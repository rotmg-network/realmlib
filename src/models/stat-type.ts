/**
 * A list of the stat types which are used to describe an entity's attributes.
 * Values are for the current game build (6.11) and must match the live
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
  ALT_TEXTURE_STAT = 61,
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
  UNKNOWN_74 = 74, // always 1000
  MATERIAL_CAP_STAT = 72,
  HASBACKPACK_STAT = 79,
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
  NEW_CON_STAT = 96,
  FORTUNE_TOKEN_STAT = 97,
  SUPPORTER_POINTS_STAT = 98,
  SUPPORTER_STAT = 99,
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
  UNKNOWN121 = 121,
  UNKNOWN123 = 123,
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
  UNKNOWN_148 = 148, // 0, related to pet
  UNKNOWN_155 = 155,
  UNKNOWN_158 = 158, // always 0

  // Enemy-only stats seen throughout the Oryx Sanctuary/Castle/Cellar
  // captures, always as a pair, never on the player. 125 varies over an
  // object's lifetime between a small set of recurring signed-int values
  // (shared across many objects); 126 is ~9.1M-9.8M and climbs with spawn
  // order. Likely a server-side per-spawn tag (encounter/wave id + counter),
  // unconfirmed. statValueTwo is always -1.
  UNKNOWN_125 = 125,
  UNKNOWN_126 = 126,
  // Rare timer-like stats. 122 observed 1500/6000/9500 on assorted objects;
  // 73 observed 800 on one enemy type. Sits in the material/potion stat gap.
  UNKNOWN_73 = 73,
  UNKNOWN_122 = 122,

  // Observed on players in captured sessions but not yet named. Values noted
  // are from a level-1 seasonal Rogue and a level-20 Wizard (cults capture).
  UNKNOWN_23 = 23, // observed 1
  UNKNOWN_75 = 75, // observed 0
  UNKNOWN_124 = 124, // observed 151
  UNKNOWN_129 = 129, // observed -1
  UNKNOWN_130 = 130, // observed 0
  UNKNOWN_139 = 139, // observed -1; 139-146 sit right after BACKPACK_7 and are
  UNKNOWN_140 = 140, // all -1 like empty slots — possibly a second slot bank
  UNKNOWN_141 = 141,
  UNKNOWN_142 = 142,
  UNKNOWN_143 = 143,
  UNKNOWN_144 = 144,
  UNKNOWN_145 = 145,
  UNKNOWN_146 = 146,
  UNKNOWN_149 = 149, // observed -1
  UNKNOWN_152 = 152, // observed 86
  UNKNOWN_153 = 153, // observed 14735788
  UNKNOWN_154 = 154, // observed 0
  UNKNOWN_156 = 156, // observed 9
  UNKNOWN_157 = 157, // observed 0
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
