import { expect } from 'chai';
import {
  ObjectStatusData,
  Reader,
  StatData,
  StatType,
  WorldPosData,
  Writer,
  processStatData,
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
  it('maps stats onto the right PlayerData fields', () => {
    const playerData = processStatData([
      statData(StatType.MAX_HP_STAT, 444),
      statData(StatType.HP_STAT, 420),
      statData(StatType.LEVEL_STAT, 15),
      statData(StatType.CREDITS_STAT, 40),
      statData(StatType.TEXTURE_STAT, 1234), // id 25, numeric
      statData(StatType.INVENTORY_0_STAT, 2711),
      statData(StatType.BACKPACK_0_STAT, 999), // id 131 -> inventory slot 12
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
    expect(playerData.name).to.equal('Wizard');
    expect(playerData.exp).to.equal(9814);
    expect(playerData.bxp).to.equal(14561542);
    expect(playerData.seasonal).to.equal(true);
    expect(playerData.accountLevel).to.equal(35);
    expect(playerData.accountLevelExp).to.equal(406026);
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
