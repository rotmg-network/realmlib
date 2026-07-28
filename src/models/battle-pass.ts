/**
 * Item entry in the AppEngine `/season/bpInfo` JSON response.
 *
 * This HTTP read model is separate from game-socket Battle Pass claim packets.
 */
export interface BattlePassRewardItem {
  amount: number;
  autoconsume: boolean;
  type: number;
}

/** Free and exalted reward tracks for one Battle Pass milestone. */
export interface BattlePassRewards {
  coupons: number;
  exaltedCoupons: number;
  credits: number;
  exaltedCredits: number;
  items: BattlePassRewardItem[];
  exaltItems: BattlePassRewardItem[];
}

/** One milestone from the AppEngine Battle Pass definition. */
export interface BattlePassMilestone {
  bxp: number;
  /** Repeat interval used by repeatable milestones; zero for regular tiers. */
  bxp_interval: number;
  id: number;
  rewards: BattlePassRewards;
}

/** Purchasable Battle Pass progress boost. */
export interface BattlePassBoost {
  price: number;
  amount: number;
}

/** Previous-track currency state returned alongside the active pass. */
export interface BattlePassPreviousState {
  coupons: number;
}

/** The `battlePass` object in an AppEngine `/season/bpInfo` response. */
export interface BattlePassInfo {
  id: string;
  backgroundUrl: string;
  title: string;
  start: number;
  end: number;
  milestones: BattlePassMilestone[];
  exaltedPrice: number;
  boost: BattlePassBoost[];
  weeklyBxpCap: number;
  weeklyExaltBxpCap: number;
  exaltDescription: string;
  bxp: number;
  /** Claimed milestone ids are JSON strings, not numbers. */
  claimed: string[];
  exalted: boolean;
  coupons: number;
  /** Repeat counts keyed by string milestone id. */
  repeatables: Record<string, number>;
  previous: BattlePassPreviousState;
}

/** Successful AppEngine `/season/bpInfo` JSON response. */
export interface BattlePassInfoResponse {
  battlePass: BattlePassInfo;
}
