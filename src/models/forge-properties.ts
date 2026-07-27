
/**
 * The type of dust mapped to ID
 *  "assembly": "Assembly-CSharp",
 *    "name": "PECLBJPGJOD",
 */
export enum DustType {
  None = 0,
  GreenDust = 1,
  /** @deprecated Typo retained for source compatibility; use {@link BlueDust}. */
  NlueDust = 2,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- compatibility alias
  BlueDust = 2,
  YellowDust = 3,
  PurpleDust = 4,
  RedDust = 5
}

/**
 * An objects in-game properties used when forging or dismantling
 */
export interface ForgeProperties {
  /**
   * The type of the object
   */
  objectType: number;
  /**
   * The ID of the object
   */
  objectId: number;
  /**
   * Whether the item can be dismantled in the forge
   */
  canDismantle: boolean;
  /**
   * Whether the item can be crafted in the forge
   */
  canCraft: boolean;
  /**
   * The description of the item
   */
  description: string;
  /**
   * The common resources gained when using the item
   */
  commonResourceGain: number;
  /**
   * The rare resources gained when using the item
   */
  rareResourceGain: number;
  /**
   * The legendary resources gained when using the item
   */
  legendaryResourceGain: number;
  /**
   * The amount of common resources required to craft the item
   */
  commonResourceReq: number;
  /**
   * The amount of rare resources required to craft the item
   */
  rareResourceReq: number;
  /**
   * The amount of legendary resources required to craft the item
   */
  legendaryResourceReq: number;
  /**
   * An item type which is required to forge the item such as a mark
   */
  requiredItem: number;
  /**
   * The amount of the items required to craft
   */
  requiredItemCount: number;
  /**
   * The amount of forgefire it costs to craft the item
   */
  forgefireCost: number;
  /**
   * The amount of forgefire you gain from dismantling the item
   */
  forgefireDismantle: number;
  /**
   * Whether the item requires an unlocked blueprint to craft
   */
  blueprintRequired: boolean;
  /**
   * Whether the item is an ingredient used for forging
   */
  isIngredient: boolean;
}
