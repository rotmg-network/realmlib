import { Classes, GuildRank } from '.';
import { WorldPosData } from '../data';
/**
 * The properties of a player, or other entity such as an enemy
 */
export interface PlayerData {
    /**
     * The unique identifier of this entity
     * This is session-based and will be different each time an entity enters a map
     */
    objectId: number;
    /**
     * The position of the entity
     */
    worldPos: WorldPosData;
    /**
     * The name of the player
     */
    name: string;
    /**
     * The level of the player
     */
    level: number;
    /**
     * The total XP points of the player
     */
    exp: number;
    /**
     * The current character fame of the player
     */
    currentFame: number;
    /**
     * The number of stars of the player
     */
    stars: number;
    /**
     * The account id of the player. This will never change for any given player
     */
    accountId: string;
    /**
     * The account fame of the player
     */
    accountFame: number;
    /**
     * Whether or not the player has chosen a unique name
     */
    nameChosen: boolean;
    /**
     * The name of the player's guild, if they are in one
     */
    guildName: string;
    /**
     * The guild rank of this player, if they are in a guild
     */
    guildRank: GuildRank;
    /**
     * The account gold of this player
     */
    gold: number;
    /**
     * The class of the character
     */
    class: Classes;
    /**
     * The name of the character's class
     */
    className: string;
    /**
     * The maximum HP of the entity
     */
    maxHP: number;
    /**
     * The increase in max HP which has been added due to bonuses (e.g. equipping a ring)
     */
    maxHPBoost: number;
    /**
     * The maximum MP of the player
     */
    maxMP: number;
    /**
     * The increase in max MP which has been added due to bonuses (e.g. equipping a ring)
     */
    maxMPBoost: number;
    /**
     * The current HP of the entity
     */
    hp: number;
    /**
     * The current MP of the player
     */
    mp: number;
    /**
     * The attack stat of this player. This includes stat bonuses from equipped items
     */
    atk: number;
    /**
     * The amount of attack which has been added due to bonuses (e.g. equipping armor)
     */
    atkBoost: number;
    /**
     * The defense stat of this player. This includes stat bonuses from equipped items
     */
    def: number;
    /**
     * The amount of defense which has been added due to bonuses (e.g. equipping armor)
     */
    defBoost: number;
    /**
     * The speed stat of this player. This includes stat bonuses from equipped items
     */
    spd: number;
    /**
     * The amount of speed which has been added due to bonuses (e.g. equipping armor)
     */
    spdBoost: number;
    /**
     * The dexterity stat of this player. This includes stat bonuses from equipped items
     */
    dex: number;
    /**
     * The amount of dexterity which has been added due to bonuses (e.g. equipping armor)
     */
    dexBoost: number;
    /**
     * The wisdom stat of this player. This includes stat bonuses from equipped items
     */
    wis: number;
    /**
     * The amount of wisdom which has been added due to bonuses (e.g. equipping armor)
     */
    wisBoost: number;
    /**
     * The vitality stat of this player. This includes stat bonuses from equipped items
     */
    vit: number;
    /**
     * The amount of vitality which has been added due to bonuses (e.g. equipping armor)
     */
    vitBoost: number;
    /**
     * The condition flags for this entity.
     * The number itself will be meaningless, the effects are represented with individual bits of the number
     */
    condition: number;
    /**
     * The number of HP potions this player has stored
     */
    hpPots: number;
    /**
     * The number of MP potions this player has stored
     */
    mpPots: number;
    /**
     * Whether or not this player has a backpack
     */
    hasBackpack: boolean;
    /**
     * The contents of the players inventory.
     * Items are represented by their item id, or `-1` if the slot is empty
     */
    inventory: number[];
    /**
     * The server this entity is connected to.
     * @deprecated This is only guaranteed to be correct for players tracked by the player tracker
     */
    server: string;
    /**
     * The size of this player
     */
    size: number;
    /**
     * The amount of EXP required to advance to the next level
     */
    nextLevelExp: number;
    /**
     * The clothing dye of this player
     */
    clothingDye: number;
    /**
     * The accessory dye of this player
     */
    accessoryDye: number;
    /**
     * The amount of fame required to achieve the next class quest
     */
    nextClassQuestFame: number;
    /**
     * > Unknown
     */
    legendaryRank: number;
    /**
     * Whether or not this player has an active XP booster
     */
    xpBoosted: boolean;
    /**
     * The amount of time left of this player's XP booster
     */
    xpBoostTime: number;
    /**
     * The skin of this player
     */
    texture: number;
    /**
     * The number of fortune tokens this player has
     */
    fortuneTokens: number;
    /**
     * The multiplier for projectile speed for shots from this player
     */
    projSpeedMult: number;
    /**
     * The multiplier for projectile lifetime for shots from this player
     */
    projLifeMult: number;
    /**
     * The players exalted HP stat
     */
    exaltedHP: number;
    /**
     * The players exalted MP stat
     */
    exaltedMP: number;
    /**
     * The players exalted Attack stat
     */
    exaltedAtt: number;
    /**
     * The players exalted Defense stat
     */
    exaltedDef: number;
    /**
     * The players exalted Speed stat
     */
    exaltedSpd: number;
    /**
     * The players exalted Dexterity stat
     */
    exaltedDex: number;
    /**
     * The players exalted Vitality stat
     */
    exaltedVit: number;
    /**
     * The players exalted Wisdom stat
     */
    exaltedWis: number;
    /**
     * The potion type in the first quickslot
     */
    potionOneType: number;
    /**
     * The amount of potions in the first quickslot
     */
    potionOneAmount: number;
    /**
     * The potion type in the second quickslot
     */
    potionTwoType: number;
    /**
     * The amount of potions in the second quickslot
     */
    potionTwoAmount: number;
    /**
     * The potion type in the third quickslot
     */
    potionThreeType: number;
    /**
     * The amount of potions in the third quickslot
     */
    potionThreeAmount: number;
    /**
     * Whether or not the player has the third quickslot unlocked
     */
    potionBelt: boolean;
    /**
     * The amount of forgefire the player has
     */
    forgefire: number;
}
/**
 * Returns a `PlayerData` object with default properties
 * @deprecated Prefer `const data = {} as PlayerData;` to create new `PlayerData` objects
 */
export declare function getDefaultPlayerData(): PlayerData;
