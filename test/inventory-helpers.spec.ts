import { expect } from 'chai';
import {
  BACKPACK_SLOT_COUNT,
  INVENTORY_SLOT_COUNT,
  SlotObjectData,
  StatType,
  inventorySlotIndex,
  isInventoryStat,
  slotIndexToStatType,
} from '../src';

// The higher-level inventory swap/tracking logic moved to the headless client.
// These are the stat<->slot helpers and SlotObjectData conveniences that remain
// in realmlib (the wire-level primitives).

describe('inventory stat<->slot helpers', () => {
  it('maps INVENTORY_0..11 to flat slots 0..11', () => {
    expect(inventorySlotIndex(StatType.INVENTORY_0_STAT)).to.equal(0);
    expect(inventorySlotIndex(StatType.INVENTORY_11_STAT)).to.equal(11);
  });

  it('maps BACKPACK_0..7 to flat slots 12..19', () => {
    expect(inventorySlotIndex(StatType.BACKPACK_0_STAT)).to.equal(INVENTORY_SLOT_COUNT);
    expect(inventorySlotIndex(StatType.BACKPACK_7_STAT)).to.equal(INVENTORY_SLOT_COUNT + BACKPACK_SLOT_COUNT - 1);
  });

  it('returns null for non-inventory stats', () => {
    expect(inventorySlotIndex(StatType.MAX_HP_STAT)).to.equal(null);
    expect(isInventoryStat(StatType.NAME_STAT)).to.equal(false);
    expect(isInventoryStat(StatType.INVENTORY_3_STAT)).to.equal(true);
  });

  it('round-trips every slot through slotIndexToStatType', () => {
    for (let i = 0; i < INVENTORY_SLOT_COUNT + BACKPACK_SLOT_COUNT; i++) {
      expect(inventorySlotIndex(slotIndexToStatType(i)!)).to.equal(i);
    }
    expect(slotIndexToStatType(INVENTORY_SLOT_COUNT + BACKPACK_SLOT_COUNT)).to.equal(null);
    expect(slotIndexToStatType(-1)).to.equal(null);
  });
});

describe('SlotObjectData helpers', () => {
  it('identifies empty and null slots', () => {
    expect(SlotObjectData.from(1194, 1, -1).isEmpty()).to.equal(true);
    expect(SlotObjectData.from(1194, 1, 2648).isEmpty()).to.equal(false);
    expect(SlotObjectData.from(0, 0, 0).isNull()).to.equal(true);
    expect(SlotObjectData.from(1194, 0, 0).isNull()).to.equal(false);
  });

  it('supports equals and clone', () => {
    const slot = SlotObjectData.from(55603, 0, 2991);
    expect(slot.equals(slot.clone())).to.equal(true);
    expect(slot.equals(SlotObjectData.from(55603, 1, 2991))).to.equal(false);
  });
});
