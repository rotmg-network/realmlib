import { expect } from 'chai';
import {
  ConditionEffect,
  ConditionEffectBits,
  ConditionEffectBits2,
  hasConditionEffect,
  ObjectStatusData,
  Reader,
  StatData,
  StatType,
  WorldPosData,
  Writer,
  processStatData,
  PLAYER_STAT_HANDLED_TYPES,
} from '../src';

function statData(statType: number, value: number, str = ''): StatData {
  const stat = new StatData();
  stat.statType = statType;
  stat.statValue = value;
  stat.stringStatValue = str;
  return stat;
}

function toReader(writer: Writer): Reader {
  const reader = new Reader(writer.index);
  writer.buffer.copy(reader.buffer, 0, 0, writer.index);
  reader.index = 0;
  return reader;
}

describe('StatData.isStringStat (current build)', () => {
  const stringStats = [
    StatType.EXP_STAT,
    StatType.NAME_STAT,
    StatType.ACCOUNT_ID_STAT,
    StatType.OWNER_ACCOUNT_ID_STAT,
    StatType.GUILD_NAME_STAT,
    StatType.MATERIAL_AMOUNT_STAT,
    StatType.MATERIAL_CAP_STAT,
    StatType.ENCHANTMENTS_STAT,
    StatType.PET_NAME_STAT,
    StatType.GRAVE_ACCOUNT_ID,
    StatType.MODIFIERS_STAT,
    StatType.DUST_AMOUNT_STAT,
    StatType.CRUCIBLE_STAT,
    StatType.DUST_CAP_STAT,
    StatType.UNKNOWN_155,
  ];
  const numericStats = [
    StatType.MAX_HP_STAT,
    StatType.HP_STAT,
    StatType.LEVEL_STAT,
    StatType.TEXTURE_STAT,
    StatType.BACKPACK_0_STAT,
    StatType.INVENTORY_0_STAT,
    StatType.CREDITS_STAT,
  ];

  it('treats the current string stats as strings', () => {
    for (const type of stringStats) {
      expect(statData(type, 0).isStringStat(), StatType[type]).to.equal(true);
    }
  });

  it('treats numeric stats as non-strings', () => {
    for (const type of numericStats) {
      expect(statData(type, 0).isStringStat(), StatType[type]).to.equal(false);
    }
  });
});

describe('processStatData (current build ids)', () => {
  it('publishes the explicit projection-handler inventory', () => {
    expect(new Set(PLAYER_STAT_HANDLED_TYPES).size).to.equal(PLAYER_STAT_HANDLED_TYPES.length);
    expect(PLAYER_STAT_HANDLED_TYPES).to.include.members([
      StatType.NAME_STAT,
      StatType.HP_STAT,
      StatType.GUILD_NAME_STAT,
      StatType.POTION_THREE_TYPE,
      StatType.EXALTED_WIS,
    ]);
  });

  it('maps stats onto the right PlayerData fields', () => {
    const playerData = processStatData([
      statData(StatType.MAX_HP_STAT, 444),
      statData(StatType.HP_STAT, 420),
      statData(StatType.LEVEL_STAT, 15),
      statData(StatType.CREDITS_STAT, 40),
      statData(StatType.TEXTURE_STAT, 1234), // id 25, numeric
      statData(StatType.INVENTORY_0_STAT, 2711),
      statData(StatType.BACKPACK_0_STAT, 999), // id 131 -> inventory slot 12
      statData(StatType.BACKPACK_7_STAT, 777),
      statData(StatType.BACKPACK_8_STAT, 888),
      statData(StatType.BACKPACK_15_STAT, 1515),
      statData(StatType.NAME_STAT, 0, 'Wizard'), // string stat
      statData(StatType.EXP_STAT, 0, '9814'), // string stat parsed to a number
      statData(StatType.BXP_STAT, 14561542),
      statData(StatType.SEASONAL_CHARACTER_STAT, 1),
      statData(StatType.ACCOUNT_LEVEL_STAT, 35),
      statData(StatType.ACCOUNT_LEVEL_EXP_STAT, 406026),
    ]);

    expect(playerData.maxHP).to.equal(444);
    expect(playerData.hp).to.equal(420);
    expect(playerData.level).to.equal(15);
    expect(playerData.gold).to.equal(40);
    expect(playerData.texture).to.equal(1234);
    expect(playerData.inventory[0]).to.equal(2711);
    expect(playerData.inventory[12]).to.equal(999);
    expect(playerData.inventory[19]).to.equal(777);
    expect(playerData.inventory[20]).to.equal(888);
    expect(playerData.inventory[27]).to.equal(1515);
    expect(playerData.name).to.equal('Wizard');
    expect(playerData.exp).to.equal(9814);
    expect(playerData.bxp).to.equal(14561542);
    expect(playerData.seasonal).to.equal(true);
    expect(playerData.accountLevel).to.equal(35);
    expect(playerData.accountLevelExp).to.equal(406026);
  });

  it('returns an honest partial patch for an incomplete stat list', () => {
    const playerData = processStatData([statData(StatType.HP_STAT, 420)]);

    expect(playerData).to.deep.equal({ inventory: [], hp: 420 });
    expect(playerData).not.to.have.property('objectId');
    expect(playerData).not.to.have.property('name');
  });

  it('separates name decoration metadata from the visible name', () => {
    const playerData = processStatData([statData(StatType.NAME_STAT, 0, 'FaZeRaptor,a19d,fe3')]);
    expect(playerData.name).to.equal('FaZeRaptor');
    expect(playerData.nameTitle).to.equal('a19d');
    expect(playerData.nameBackground).to.equal('fe3');
  });
});

describe('ObjectStatusData round trip', () => {
  it('round-trips a mix of numeric and string (material/enchant) stats', () => {
    const osd = new ObjectStatusData();
    osd.objectId = 80863;
    osd.pos = new WorldPosData(105.5, 163.25);
    osd.stats = [
      statData(StatType.MAX_HP_STAT, 444),
      statData(StatType.MATERIAL_AMOUNT_STAT, 0, '50'),
      statData(StatType.LEVEL_STAT, 15),
      statData(StatType.ENCHANTMENTS_STAT, 0, 'abc|def'),
    ];

    const writer = new Writer();
    osd.write(writer);

    const out = new ObjectStatusData();
    out.read(toReader(writer));

    expect(out.objectId).to.equal(80863);
    expect(out.pos.x).to.equal(105.5);
    expect(out.stats).to.have.length(4);
    expect(out.stats[0].statValue).to.equal(444);
    expect(out.stats[1].stringStatValue).to.equal('50');
    expect(out.stats[2].statValue).to.equal(15);
    expect(out.stats[3].stringStatValue).to.equal('abc|def');
  });
});

describe('hasConditionEffect', () => {
  it('reads effects 1-31 from the first condition word', () => {
    expect(hasConditionEffect(ConditionEffectBits.STASIS, 0, ConditionEffect.STASIS)).to.equal(true);
    expect(hasConditionEffect(ConditionEffectBits.PARALYZED, 0, ConditionEffect.PARALYZED)).to.equal(true);
    expect(hasConditionEffect(0, 0, ConditionEffect.STASIS)).to.equal(false);
  });

  it('reads effects 32-63 from the second condition word', () => {
    expect(hasConditionEffect(0, ConditionEffectBits2.PETRIFIED, ConditionEffect.PETRIFIED)).to.equal(true);
    expect(hasConditionEffect(0, ConditionEffectBits2.CURSE, ConditionEffect.CURSE)).to.equal(true);
    // Bit 31 of the second word — the case plain `1 << 31` gets wrong.
    expect(hasConditionEffect(0, ConditionEffectBits2.UNKNOWN_63, ConditionEffect.UNKNOWN_63)).to.equal(true);
  });

  it('does not confuse the two words', () => {
    // STASIS is 22 (first word); testing it against condition2 must not fire.
    expect(hasConditionEffect(0, ConditionEffectBits.STASIS, ConditionEffect.STASIS)).to.equal(false);
    expect(hasConditionEffect(ConditionEffectBits2.PETRIFIED, 0, ConditionEffect.PETRIFIED)).to.equal(false);
  });
});
