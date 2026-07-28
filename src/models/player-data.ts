import type { WorldPosData } from '../data';
import { Classes } from './classes';
import { GuildRank } from './guild-rank';

/** Identity, appearance, and map-local location fields. */
export interface PlayerIdentityLocationData {
  /** Session-local entity id. */
  objectId: number;
  worldPos: WorldPosData;
  name: string;
  /** Optional title/name-decoration token appended to NAME_STAT. */
  nameTitle?: string;
  /** Optional name-background token appended to NAME_STAT. */
  nameBackground?: string;
  class: Classes;
  className: string;
  /** @deprecated Only guaranteed for entities managed by the player tracker. */
  server: string;
  size: number;
  texture: number;
  clothingDye: number;
  accessoryDye: number;
}

/** Account and guild fields shared across character projections. */
export interface PlayerAccountGuildData {
  accountId: string;
  accountFame: number;
  nameChosen: boolean;
  guildName: string;
  guildRank: GuildRank;
  gold: number;
}

/** Current and maximum combat stats, bonuses, and condition flags. */
export interface PlayerCombatData {
  maxHP: number;
  maxHPBoost: number;
  maxMP: number;
  maxMPBoost: number;
  hp: number;
  mp: number;
  atk: number;
  atkBoost: number;
  def: number;
  defBoost: number;
  spd: number;
  spdBoost: number;
  dex: number;
  dexBoost: number;
  wis: number;
  wisBoost: number;
  vit: number;
  vitBoost: number;
  /** First condition bit field (`CONDITION_STAT`). */
  condition: number;
  /** Second condition bit field (`NEW_CON_STAT`). */
  condition2: number;
  /** Projectile-speed multiplier represented as a decimal multiplier. */
  projSpeedMult: number;
  /** Projectile-lifetime multiplier represented as a decimal multiplier. */
  projLifeMult: number;
}

/** Inventory, backpack, and storage-potion fields. */
export interface PlayerInventoryData {
  hpPots: number;
  mpPots: number;
  hasBackpack: boolean;
  /** Flat equipment/inventory/backpack slots; `-1` denotes an empty slot. */
  inventory: number[];
}

/** Quick-slot potion selections whose amount semantics remain unresolved. */
export interface PlayerPotionQuickSlotData {
  potionOneType: number;
  potionOneAmount?: number;
  potionTwoType: number;
  potionTwoAmount?: number;
  potionThreeType: number;
  potionThreeAmount?: number;
  potionBelt: boolean;
}

/** Character/account progression, boosters, currencies, and exaltations. */
export interface PlayerProgressionData {
  level: number;
  exp: number;
  bxp: number;
  seasonal: boolean;
  accountLevel: number;
  accountLevelExp: number;
  currentFame: number;
  stars: number;
  nextLevelExp: number;
  nextClassQuestFame: number;
  legendaryRank: number;
  xpBoosted: boolean;
  xpBoostTime: number;
  fortuneTokens: number;
  exaltedHP: number;
  exaltedMP: number;
  exaltedAtt: number;
  exaltedDef: number;
  exaltedSpd: number;
  exaltedDex: number;
  exaltedVit: number;
  exaltedWis: number;
  forgefire: number;
}

/**
 * Compatibility aggregate for the complete consumer-facing player/entity
 * model. Facet interfaces can be used independently by narrower consumers.
 */
export interface PlayerData
  extends PlayerIdentityLocationData,
  PlayerAccountGuildData,
  PlayerCombatData,
  PlayerInventoryData,
  PlayerPotionQuickSlotData,
  PlayerProgressionData {}

/**
 * Incremental player/entity data produced from UPDATE and NEWTICK stat lists.
 * `inventory` is always present so slot updates have a stable target.
 */
export type PlayerDataPatch = Partial<Omit<PlayerData, 'inventory'>> & {
  inventory: number[];
};
