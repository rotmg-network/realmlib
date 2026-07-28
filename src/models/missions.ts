/** Character modes eligible to progress a mission. Values form a bitmask. */
export enum MissionParticipants {
  None = 0,
  RegularOnly = 1,
  SeasonalOnly = 2,
  CrucibleOnly = 4,
  All = 255
}

/** Objective kinds used by the current mission system. */
export enum MissionObjectiveType {
  Unknown = -1,
  KillType = 1,
  KillAny = 2,
  CompleteDungeonById = 3,
  CompleteDungeonByDifficulty = 4,
  FeedPet = 5,
  FusePets = 6,
  CloseRealm = 7,
  DrinkStatPotionType = 8,
  DrinkStatPotionAny = 9,
  ForgeLabel = 10,
  MaximizeStat = 11,
  CompleteDungeonByDifficultyRange = 12,
  MaximizeStatsOnOneChar = 13,
  CompleteDungeonTime = 14,
  GainExp = 15,
  KillQuestMonsters = 16,
  HatchEggs = 17,
  CompleteDailyQuests = 18,
  BiomeScore = 19,
  Consume = 20,
  ForgeItemsTier = 41
}

/** Reward payload categories used in mission definitions. */
export enum MissionRewardKind {
  Unknown = -1,
  Item = 0,
  BXP = 1
}

/** Whether a mission can be selected for progress tracking. */
export enum MissionTrackingState {
  Unknown = -1,
  Tracked = 0,
  CanBeTracked = 1,
  UnavailableToTrack = 2,
  Completed = 10,
  Claimed = 20,
  ClaimedOnCooldown = 21
}

/** Lifecycle state of a mission. */
export enum MissionState {
  Active = 0,
  Completed = 1,
  Claimed = 2,
  OnCooldown = 3
}

/**
 * Mission repeat cadence, from client enum `BKKFIGGNCBD` (build 6.12.0.2.0).
 */
export enum MissionRepeatCadence {
  Always = 0,
  Never = 1,
  Daily = 2,
  Weekly = 3,
  Monthly = 4,
  OnlyOnce = 5,
  EveryOtherDay = 6
}
