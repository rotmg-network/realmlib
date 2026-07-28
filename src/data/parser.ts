import { ObjectData, ObjectStatusData, StatData } from '.';
import { inventorySlotIndex, PlayerData, PlayerDataPatch, StatType } from '../models';

type StatHandler = (playerData: PlayerDataPatch, stat: StatData) => void;

const assignNumber =
  (field: keyof PlayerData): StatHandler =>
  (playerData, stat) => {
    Object.assign(playerData, { [field]: stat.statValue });
  };
const assignString =
  (field: keyof PlayerData): StatHandler =>
  (playerData, stat) => {
    Object.assign(playerData, { [field]: stat.stringStatValue });
  };
const assignBoolean =
  (field: keyof PlayerData): StatHandler =>
  (playerData, stat) => {
    Object.assign(playerData, { [field]: stat.statValue !== 0 });
  };

const statHandlers = new Map<number, StatHandler>();

const numberFields: Array<[number, keyof PlayerData]> = [
  [StatType.LEVEL_STAT, 'level'],
  [StatType.BXP_STAT, 'bxp'],
  [StatType.ACCOUNT_LEVEL_STAT, 'accountLevel'],
  [StatType.ACCOUNT_LEVEL_EXP_STAT, 'accountLevelExp'],
  [StatType.CURR_FAME_STAT, 'currentFame'],
  [StatType.NUM_STARS_STAT, 'stars'],
  [StatType.FAME_STAT, 'accountFame'],
  [StatType.CREDITS_STAT, 'gold'],
  [StatType.MAX_HP_STAT, 'maxHP'],
  [StatType.MAX_MP_STAT, 'maxMP'],
  [StatType.HP_STAT, 'hp'],
  [StatType.MP_STAT, 'mp'],
  [StatType.ATTACK_STAT, 'atk'],
  [StatType.ATTACK_BOOST_STAT, 'atkBoost'],
  [StatType.DEFENSE_STAT, 'def'],
  [StatType.DEFENSE_BOOST_STAT, 'defBoost'],
  [StatType.SPEED_STAT, 'spd'],
  [StatType.SPEED_BOOST_STAT, 'spdBoost'],
  [StatType.DEXTERITY_STAT, 'dex'],
  [StatType.DEXTERITY_BOOST_STAT, 'dexBoost'],
  [StatType.VITALITY_STAT, 'vit'],
  [StatType.VITALITY_BOOST_STAT, 'vitBoost'],
  [StatType.CONDITION_STAT, 'condition'],
  [StatType.NEW_CON_STAT, 'condition2'],
  [StatType.WISDOM_STAT, 'wis'],
  [StatType.WISDOM_BOOST_STAT, 'wisBoost'],
  [StatType.HEALTH_POTION_STACK_STAT, 'hpPots'],
  [StatType.MAGIC_POTION_STACK_STAT, 'mpPots'],
  [StatType.GUILD_RANK_STAT, 'guildRank'],
  [StatType.SIZE_STAT, 'size'],
  [StatType.NEXT_LEVEL_EXP_STAT, 'nextLevelExp'],
  [StatType.TEX1_STAT, 'clothingDye'],
  [StatType.TEX2_STAT, 'accessoryDye'],
  [StatType.MAX_HP_BOOST_STAT, 'maxHPBoost'],
  [StatType.MAX_MP_BOOST_STAT, 'maxMPBoost'],
  [StatType.NEXT_CLASS_QUEST_FAME_STAT, 'nextClassQuestFame'],
  [StatType.LEGENDARY_RANK_STAT, 'legendaryRank'],
  [StatType.XP_TIMER_STAT, 'xpBoostTime'],
  [StatType.TEXTURE_STAT, 'texture'],
  [StatType.FORTUNE_TOKEN_STAT, 'fortuneTokens'],
  [StatType.EXALTED_HP, 'exaltedHP'],
  [StatType.EXALTED_MP, 'exaltedMP'],
  [StatType.EXALTED_ATT, 'exaltedAtt'],
  [StatType.EXALTED_DEF, 'exaltedDef'],
  [StatType.EXALTED_SPEED, 'exaltedSpd'],
  [StatType.EXALTED_DEX, 'exaltedDex'],
  [StatType.EXALTED_VIT, 'exaltedVit'],
  [StatType.EXALTED_WIS, 'exaltedWis'],
  [StatType.POTION_ONE_TYPE, 'potionOneType'],
  [StatType.POTION_TWO_TYPE, 'potionTwoType'],
  [StatType.POTION_THREE_TYPE, 'potionThreeType'],
  [StatType.FORGEFIRE, 'forgefire'],
];
for (const [statType, field] of numberFields) {
  statHandlers.set(statType, assignNumber(field));
}

const stringFields: Array<[number, keyof PlayerData]> = [
  [StatType.ACCOUNT_ID_STAT, 'accountId'],
  [StatType.GUILD_NAME_STAT, 'guildName'],
];
for (const [statType, field] of stringFields) {
  statHandlers.set(statType, assignString(field));
}

const booleanFields: Array<[number, keyof PlayerData]> = [
  [StatType.SEASONAL_CHARACTER_STAT, 'seasonal'],
  [StatType.NAME_CHOSEN_STAT, 'nameChosen'],
  [StatType.XP_BOOSTED_STAT, 'xpBoosted'],
  [StatType.POTION_BELT, 'potionBelt'],
];
for (const [statType, field] of booleanFields) {
  statHandlers.set(statType, assignBoolean(field));
}
statHandlers.set(StatType.HASBACKPACK_STAT, (playerData, stat) => {
  playerData.hasBackpack = stat.statValue === 1;
});
statHandlers.set(StatType.EXP_STAT, (playerData, stat) => {
  playerData.exp = Number.parseInt(stat.stringStatValue, 10) || 0;
});
statHandlers.set(StatType.PROJECTILE_SPEED_MULT, (playerData, stat) => {
  playerData.projSpeedMult = stat.statValue / 1000;
});
statHandlers.set(StatType.PROJECTILE_LIFE_MULT, (playerData, stat) => {
  playerData.projLifeMult = stat.statValue / 1000;
});
statHandlers.set(StatType.NAME_STAT, (playerData, stat) => {
  const [name, title, background, ...rest] = stat.stringStatValue.split(',');
  playerData.name = name;
  playerData.nameTitle = title;
  playerData.nameBackground = [background, ...rest].filter(Boolean).join(',') || undefined;
});

/** Stat ids with an explicit non-inventory player projection handler. */
export const PLAYER_STAT_HANDLED_TYPES: readonly number[] = Object.freeze(
  Array.from(statHandlers.keys()),
);

/** Processes an object and returns its incremental player/entity projection. */
export function processObject(data: ObjectData): PlayerDataPatch {
  const playerData = processObjectStatus(data.status);
  playerData.class = data.objectType;
  return playerData;
}

export function processObjectStatus(data: ObjectStatusData, currentData: PlayerData): PlayerData;
export function processObjectStatus(
  data: ObjectStatusData,
  currentData?: PlayerDataPatch,
): PlayerDataPatch;
export function processObjectStatus(
  data: ObjectStatusData,
  currentData?: PlayerDataPatch,
): PlayerDataPatch {
  const playerData = processStatData(data.stats, currentData);
  playerData.worldPos = data.pos;
  playerData.objectId = data.objectId;
  return playerData;
}

export function processStatData(stats: StatData[], currentData: PlayerData): PlayerData;
export function processStatData(stats: StatData[], currentData?: PlayerDataPatch): PlayerDataPatch;
export function processStatData(stats: StatData[], currentData?: PlayerDataPatch): PlayerDataPatch {
  const playerData: PlayerDataPatch = currentData || { inventory: [] };
  playerData.inventory ||= [];

  for (const stat of stats) {
    const handler = statHandlers.get(stat.statType);
    if (handler) {
      handler(playerData, stat);
      continue;
    }
    const slotIndex = inventorySlotIndex(stat.statType);
    if (slotIndex !== null) {
      playerData.inventory[slotIndex] = stat.statValue;
    }
  }
  return playerData;
}
