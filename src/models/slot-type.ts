/**
 * Equipment slot types (`<SlotType>` in object.xml).
 *
 * Derived empirically from the 6.12.0.2.0 client's `object.xml` rather than
 * copied from a wiki: for each SlotType id, the dominant category label across
 * every item in that slot names it unambiguously (e.g. slot 1 → 123 WEAPON /
 * 98 SWORD, slot 14 → 102 ARMOR / 100 ROBE). Slot 26 is the only unlabelled
 * one; every item in it is a pet egg.
 */
export enum SlotType {
  Sword = 1,
  Dagger = 2,
  Bow = 3,
  Tome = 4,
  Shield = 5,
  LeatherArmor = 6,
  HeavyArmor = 7,
  Wand = 8,
  Ring = 9,
  /** Consumables, potions, keys, dyes, shaders — the catch-all bag slot. */
  Consumable = 10,
  Spell = 11,
  Seal = 12,
  Cloak = 13,
  Robe = 14,
  Quiver = 15,
  Helm = 16,
  Staff = 17,
  Poison = 18,
  Skull = 19,
  Trap = 20,
  Orb = 21,
  Prism = 22,
  Scepter = 23,
  Katana = 24,
  Shuriken = 25,
  PetEgg = 26,
  Wakizashi = 27,
  Lute = 28,
  Mace = 29,
  Sheath = 30,
  Sigil = 31
}

/** SlotTypes that hold a primary weapon. */
export const WEAPON_SLOT_TYPES: readonly SlotType[] = [
  SlotType.Sword,
  SlotType.Dagger,
  SlotType.Bow,
  SlotType.Wand,
  SlotType.Staff,
  SlotType.Katana
];

/** SlotTypes that hold a class ability. */
export const ABILITY_SLOT_TYPES: readonly SlotType[] = [
  SlotType.Tome,
  SlotType.Shield,
  SlotType.Spell,
  SlotType.Seal,
  SlotType.Cloak,
  SlotType.Quiver,
  SlotType.Helm,
  SlotType.Poison,
  SlotType.Skull,
  SlotType.Trap,
  SlotType.Orb,
  SlotType.Prism,
  SlotType.Scepter,
  SlotType.Shuriken,
  SlotType.Wakizashi,
  SlotType.Lute,
  SlotType.Mace,
  SlotType.Sheath,
  SlotType.Sigil
];

/** SlotTypes that hold body armor. */
export const ARMOR_SLOT_TYPES: readonly SlotType[] = [
  SlotType.LeatherArmor,
  SlotType.HeavyArmor,
  SlotType.Robe
];

/**
 * Index of each equipment slot within `PlayerData.inventory`. Slots 0-3 are
 * the equipped items, 4-11 the inventory proper, 12-27 the backpack banks.
 */
export enum EquipmentSlot {
  Weapon = 0,
  Ability = 1,
  Armor = 2,
  Ring = 3
}

/** First inventory (non-equipment) slot index. */
export const INVENTORY_START = 4;
/** First backpack slot index; present only when a backpack is owned. */
export const BACKPACK_START = 12;
/** One past the last backpack slot. */
export const BACKPACK_END = 28;
