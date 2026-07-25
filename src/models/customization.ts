/**
 * The 'category' sent to /account/purchaseCustomization endpoint to buy skins, titles, emotes, entrances, etc.
 * 
 * "assembly": "Assembly-CSharp",
 *   "name": "BNFJCCLGEPO",
 */
export enum CustomizationCategory {
    None = 0,
    Item = 1,
    Fame = 2,
    Title = 3,
    Emote = 4,
    Entrance = 5,
    Dust = 6,
    CharSlot = 7,
    CharStartWith = 8,
    BoostExp = 9,
    BoostLoot = 10,
    DiscountBattlePassPercentage = 11
}