import { expect } from 'chai';
import {
  Reader,
  Writer,
  WorldPosData,
  SlotObjectData,
  FameData,
  AllyShootPacket,
  EnemyShootPacket,
  DamagePacket,
  DeathPacket,
  ExaltationUpdatePacket,
  MapInfoPacket,
  NotificationPacket,
  UpdatePacket,
  QuestObjectIdPacket,
  ReskinUnlockPacket,
  TradeStartPacket,
  UseItemPacket,
  InvDropPacket,
  SquareHitPacket,
  PlayerCalloutPacket,
  ForgeRequestPacket,
  QueueCancelPacket,
  EnemyHitPacket,
  ShootAckPacket,
  FavourPetPacket,
  RealmScoreUpdatePacket,
  CrucibleRequestPacket,
  CrucibleResponsePacket,
  BlacksmithRequestPacket,
  BlacksmithDismantlePacket,
  QuestFetchResponsePacket,
  QuestData,
  QuestRedeemPacket,
  RerollAllEnchantmentsPacket,
  EnchantPacket,
  SelectEntrancePacket,
  BuyEmotePacket,
  Unknown224Packet,
  ChangeGuildRankPacket,
  ClaimMissionPacket,
  ClaimRewardsInfoPromptPacket,
  RedeemVoucherPacket,
  VoucherResultPacket,
  ClaimAccountLevelRewardPacket,
  ClaimAccountLevelRewardResultPacket,
  ClaimRewardPacket,
  ClaimRewardResultPacket,
  ClaimRewardsInfoRequestPacket,
  ClaimMissionResultPacket,
  CreatePacket,
  EmotePacket,
  StatsPacket,
  InvResultPacket,
} from '../src';

/** Builds a Reader positioned at 0 over the given hex bytes. */
function hexReader(hex: string): Reader {
  const buffer = Buffer.from(hex, 'hex');
  const reader = new Reader(buffer.length);
  buffer.copy(reader.buffer, 0, 0, buffer.length);
  reader.index = 0;
  return reader;
}

/** Builds a Reader positioned at 0 over the bytes a Writer has produced. */
function toReader(writer: Writer): Reader {
  const reader = new Reader(writer.index);
  writer.buffer.copy(reader.buffer, 0, 0, writer.index);
  reader.index = 0;
  return reader;
}

/** Writes a packet, reads it back into a fresh instance of the same type. */
function roundTrip<T extends { write(w: Writer): void; read(r: Reader): void }>(packet: T, fresh: T): T {
  const writer = new Writer();
  packet.write(writer);
  fresh.read(toReader(writer));
  return fresh;
}

describe('reconciled packet round trips (build 6.11)', () => {
  it('AllyShootPacket', () => {
    const p = new AllyShootPacket();
    p.bulletId = 40000; // > 255, must be a u16
    p.ownerId = 12345;
    p.containerType = 3001;
    p.unknownByte = 7;
    p.angle = 1.5;
    p.unknownShort = -42;
    const out = roundTrip(p, new AllyShootPacket());
    expect(out.bulletId).to.equal(40000);
    expect(out.ownerId).to.equal(12345);
    expect(out.containerType).to.equal(3001);
    expect(out.unknownByte).to.equal(7);
    expect(out.angle).to.equal(1.5);
    expect(out.unknownShort).to.equal(-42);
  });

  it('EnemyShootPacket (with multi-shot tail)', () => {
    const p = new EnemyShootPacket();
    p.bulletId = 50000; // u16
    p.ownerId = 999;
    p.bulletType = 4;
    p.startingPos = new WorldPosData(10.5, -3.25);
    p.angle = 0.75;
    p.damage = 120;
    p.numShots = 3;
    p.angleInc = 0.25; // float32-exact
    const out = roundTrip(p, new EnemyShootPacket());
    expect(out.bulletId).to.equal(50000);
    expect(out.startingPos.x).to.equal(10.5);
    expect(out.damage).to.equal(120);
    expect(out.numShots).to.equal(3);
    expect(out.angleInc).to.equal(0.25);
  });

  it('DamagePacket (info byte + u16 bulletId)', () => {
    const p = new DamagePacket();
    p.targetId = 77;
    p.effects = [1, 5, 9];
    p.damageAmount = 60000; // u16
    p.info = 3;
    p.bulletId = 40000; // u16
    p.objectId = 555;
    const out = roundTrip(p, new DamagePacket());
    expect(out.effects).to.deep.equal([1, 5, 9]);
    expect(out.damageAmount).to.equal(60000);
    expect(out.info).to.equal(3);
    expect(out.bulletId).to.equal(40000);
    expect(out.objectId).to.equal(555);
  });

  it('DeathPacket (compressed ints + fame bonuses)', () => {
    const p = new DeathPacket();
    p.accountId = 'acct';
    p.charId = 8;
    p.killedBy = 'a Sprite God';
    p.unknownInt = 0;
    p.fameEarned = 1234;
    p.accountLevel = 12;
    p.accountXP = 999999;
    const bonus = new FameData();
    bonus.name = 'Ancestor';
    bonus.rank = 2;
    bonus.fame = 50;
    p.fameBonuses = [bonus];
    p.pcStats = 'stats';
    const out = roundTrip(p, new DeathPacket());
    expect(out.charId).to.equal(8);
    expect(out.killedBy).to.equal('a Sprite God');
    expect(out.fameEarned).to.equal(1234);
    expect(out.accountXP).to.equal(999999);
    expect(out.fameBonuses).to.have.length(1);
    expect(out.fameBonuses[0].name).to.equal('Ancestor');
    expect(out.fameBonuses[0].fame).to.equal(50);
    expect(out.pcStats).to.equal('stats');
  });

  it('ExaltationUpdatePacket (compressed-int progress)', () => {
    const p = new ExaltationUpdatePacket();
    p.objType = 782;
    p.dexterityProgress = 100000; // would overflow a byte
    p.attackProgress = -5;
    p.healthProgress = 250;
    const out = roundTrip(p, new ExaltationUpdatePacket());
    expect(out.objType).to.equal(782);
    expect(out.dexterityProgress).to.equal(100000);
    expect(out.attackProgress).to.equal(-5);
    expect(out.healthProgress).to.equal(250);
  });

  it('MapInfoPacket (full tail incl. realm scores)', () => {
    const p = new MapInfoPacket();
    p.width = 256;
    p.height = 256;
    p.name = 'Nexus';
    p.maxPlayers = 85;
    p.buildVersion = '6.11.0.0.0';
    p.viewRadius = 15;
    p.dungeonModifier = 'a;b';
    p.unknownShort2 = 1;
    p.maxRealmScore = 5000;
    p.curRealmScore = 1200;
    const out = roundTrip(p, new MapInfoPacket());
    expect(out.name).to.equal('Nexus');
    expect(out.maxPlayers).to.equal(85);
    expect(out.viewRadius).to.equal(15);
    expect(out.dungeonModifier).to.equal('a;b');
    expect(out.maxRealmScore).to.equal(5000);
    expect(out.curRealmScore).to.equal(1200);
  });

  it('NotificationPacket effect 5 (Queue: no message field)', () => {
    const p = new NotificationPacket();
    p.effect = 5;
    p.extra = 0;
    p.objectId = 321;
    p.queuePos = 7;
    const out = roundTrip(p, new NotificationPacket());
    expect(out.effect).to.equal(5);
    expect(out.objectId).to.equal(321);
    expect(out.queuePos).to.equal(7);
    expect(out.message).to.equal(''); // no message is read for Queue
  });

  it('UpdatePacket (trailing byte)', () => {
    const p = new UpdatePacket();
    p.pos = new WorldPosData(12.5, -7.25);
    p.levelType = 4;
    p.drops = [1, 2, 3];
    p.unknownByte = 9;
    const out = roundTrip(p, new UpdatePacket());
    expect(out.pos.x).to.equal(12.5);
    expect(out.levelType).to.equal(4);
    expect(out.drops).to.deep.equal([1, 2, 3]);
    expect(out.unknownByte).to.equal(9);
  });
});

describe('RealmShark-reconciled packet round trips', () => {
  it('QuestObjectIdPacket (with list)', () => {
    const p = new QuestObjectIdPacket();
    p.objectId = 4242;
    p.list = [10, 20, 30];
    const out = roundTrip(p, new QuestObjectIdPacket());
    expect(out.objectId).to.equal(4242);
    expect(out.list).to.deep.equal([10, 20, 30]);
  });

  it('ReskinUnlockPacket (type + id)', () => {
    const p = new ReskinUnlockPacket();
    p.unlockType = 2;
    p.unlockId = 987654;
    const out = roundTrip(p, new ReskinUnlockPacket());
    expect(out.unlockType).to.equal(2);
    expect(out.unlockId).to.equal(987654);
  });

  it('TradeStartPacket (trailing objectId + byte)', () => {
    const p = new TradeStartPacket();
    p.clientItems = [];
    p.partnerName = 'partner';
    p.partnerItems = [];
    p.objectId = 55555;
    p.unknownByte = 3;
    const out = roundTrip(p, new TradeStartPacket());
    expect(out.partnerName).to.equal('partner');
    expect(out.objectId).to.equal(55555);
    expect(out.unknownByte).to.equal(3);
  });

  it('UseItemPacket (trailing flag)', () => {
    const p = new UseItemPacket();
    p.time = 1000;
    p.slotObject = new SlotObjectData();
    p.itemUsePos = new WorldPosData(1.5, 2.5);
    p.useType = 1;
    p.useItemFlag = 77;
    const out = roundTrip(p, new UseItemPacket());
    expect(out.useType).to.equal(1);
    expect(out.useItemFlag).to.equal(77);
  });

  it('InvDropPacket (quick slot)', () => {
    const p = new InvDropPacket();
    p.slotObject = new SlotObjectData();
    p.quickSlot = 4;
    const out = roundTrip(p, new InvDropPacket());
    expect(out.quickSlot).to.equal(4);
  });

  it('SquareHitPacket (bulletId short)', () => {
    const p = new SquareHitPacket();
    p.time = 500;
    p.bulletId = 30000; // > 255, must be a short
    p.objectId = 8888;
    const out = roundTrip(p, new SquareHitPacket());
    expect(out.bulletId).to.equal(30000);
    expect(out.objectId).to.equal(8888);
  });

  it('PlayerCalloutPacket (type before objectId)', () => {
    const p = new PlayerCalloutPacket();
    p.calloutType = 1;
    p.playerObjId = 246810;
    const out = roundTrip(p, new PlayerCalloutPacket());
    expect(out.calloutType).to.equal(1);
    expect(out.playerObjId).to.equal(246810);
  });

  it('ForgeRequestPacket (dismantled item array)', () => {
    const p = new ForgeRequestPacket();
    p.resultItemType = 1234;
    p.dismantledItems = [new SlotObjectData(), new SlotObjectData()];
    const out = roundTrip(p, new ForgeRequestPacket());
    expect(out.resultItemType).to.equal(1234);
    expect(out.dismantledItems.length).to.equal(2);
  });

  it('QueueCancelPacket (guild string)', () => {
    const p = new QueueCancelPacket();
    p.guild = 'MyGuild';
    const out = roundTrip(p, new QueueCancelPacket());
    expect(out.guild).to.equal('MyGuild');
  });

  it('EnemyHitPacket (shooter + main ids, short bulletId)', () => {
    const p = new EnemyHitPacket();
    p.time = 700;
    p.bulletId = 20000; // short
    p.shooterId = 111;
    p.targetId = 222;
    p.kill = true;
    p.mainId = 333;
    const out = roundTrip(p, new EnemyHitPacket());
    expect(out.bulletId).to.equal(20000);
    expect(out.shooterId).to.equal(111);
    expect(out.targetId).to.equal(222);
    expect(out.kill).to.equal(true);
    expect(out.mainId).to.equal(333);
  });
});

describe('current-build packets reconciled from captured bytes', () => {
  it('ShootAckPacket reads the trailing short (no leftover)', () => {
    const reader = hexReader('00024d7d0001');
    const p = new ShootAckPacket();
    p.read(reader);
    expect(p.time).to.equal(0x00024d7d);
    expect(p.unknownShort).to.equal(1);
    expect(reader.remaining).to.equal(0);
  });

  it('ShootAckPacket round trips', () => {
    const p = new ShootAckPacket();
    p.time = 987654;
    p.unknownShort = 2;
    const out = roundTrip(p, new ShootAckPacket());
    expect(out.time).to.equal(987654);
    expect(out.unknownShort).to.equal(2);
  });

  it('FavourPetPacket reads the leading byte then a signed pet id', () => {
    const reader = hexReader('00ffffffff');
    const p = new FavourPetPacket();
    p.read(reader);
    expect(p.unknownByte).to.equal(0);
    expect(p.petId).to.equal(-1);
    expect(reader.remaining).to.equal(0);
  });

  it('FavourPetPacket round trips', () => {
    const p = new FavourPetPacket();
    p.unknownByte = 1;
    p.petId = 123456;
    const out = roundTrip(p, new FavourPetPacket());
    expect(out.unknownByte).to.equal(1);
    expect(out.petId).to.equal(123456);
  });

  it('NotificationPacket effect 11 consumes message + int + short (no leftover)', () => {
    const reader = hexReader(
      '0b2a001b416c69656e20496e766173696f6e204164657074202d20426f7373000000010001',
    );
    const p = new NotificationPacket();
    p.read(reader);
    expect(p.effect).to.equal(11);
    expect(p.message).to.equal('Alien Invasion Adept - Boss');
    expect(p.pictureType).to.equal(1);
    expect(p.uiExtra).to.equal(1);
    expect(reader.remaining).to.equal(0);
  });

  it('NotificationPacket effect 11 round trips', () => {
    const p = new NotificationPacket();
    p.effect = 11;
    p.extra = 42;
    p.message = 'Boss';
    p.pictureType = 3;
    p.uiExtra = 5;
    const out = roundTrip(p, new NotificationPacket());
    expect(out.effect).to.equal(11);
    expect(out.message).to.equal('Boss');
    expect(out.pictureType).to.equal(3);
    expect(out.uiExtra).to.equal(5);
  });

  it('RealmScoreUpdatePacket reads a single int32 (no leftover)', () => {
    const reader = hexReader('00010510');
    const p = new RealmScoreUpdatePacket();
    p.read(reader);
    expect(p.realmScore).to.equal(0x00010510);
    expect(reader.remaining).to.equal(0);
  });

  it('CrucibleRequestPacket reads the index array (no leftover)', () => {
    const reader = hexReader('0003000000000000000100000002');
    const p = new CrucibleRequestPacket();
    p.read(reader);
    expect(p.indices).to.deep.equal([0, 1, 2]);
    expect(reader.remaining).to.equal(0);
  });

  it('CrucibleRequestPacket round trips', () => {
    const p = new CrucibleRequestPacket();
    p.indices = [0, 1, 2];
    const out = roundTrip(p, new CrucibleRequestPacket());
    expect(out.indices).to.deep.equal([0, 1, 2]);
  });

  it('CrucibleResponsePacket parses echoed indices + JSON strings (no leftover)', () => {
    const hex =
      '0003000000000000000100000002000302287b226172726179223a205b7b226964223a20223636343636323637373630323330343022' +
      '2c20227469746c65223a20224465782066726f6d204265796f6e64222c202264657363223a2022536561736f6e20323920437275636962' +
      '6c65222c20226372756369626c65223a207b22736561736f6e616c6f6e6c79223a206e756c6c2c20226c656176656c696d69746174696f' +
      '6e223a206e756c6c2c20227374617274223a20313738303339303830302c2022656e64223a20313738353833343030302c202274726961' +
      '6c73223a205b5d2c20227265737472696374696f6e73223a205b7b2274797065223a20322c202273746174223a2022444558222c202270' +
      '657263656e74223a20312c202276616c7565223a20312e357d2c207b2274797065223a20322c202273746174223a2022415454222c2022' +
      '70657263656e74223a20312c202276616c7565223a20302e37357d2c207b2274797065223a20322c202273746174223a20224d41584d50' +
      '222c202270657263656e74223a20312c202276616c7565223a20302e387d5d2c2022626f6e75736573223a205b7b2274797065223a2031' +
      '2c2022616d6f756e74223a20312e31352c202270657263656e74223a20317d2c207b2274797065223a20322c2022616d6f756e74223a20' +
      '312e312c202270657263656e74223a20312c202266616d65223a20317d2c207b2274797065223a20332c202270657263656e74223a2031' +
      '2c2022616d6f756e74223a20312e317d5d7d7d5d7d000d7b226172726179223a205b5d7d000d7b226172726179223a205b5d7d';
    const reader = hexReader(hex);
    const p = new CrucibleResponsePacket();
    p.read(reader);
    expect(p.indices).to.deep.equal([0, 1, 2]);
    expect(p.data).to.have.length(3);
    expect(p.data[1]).to.equal('{"array": []}');
    expect(p.data[2]).to.equal('{"array": []}');
    expect(JSON.parse(p.data[0]).array[0].title).to.equal('Dex from Beyond');
    expect(reader.remaining).to.equal(0);
  });

  it('CrucibleResponsePacket round trips', () => {
    const p = new CrucibleResponsePacket();
    p.indices = [0, 1, 2];
    p.data = ['{"array": []}', '{"a": 1}', '{}'];
    const out = roundTrip(p, new CrucibleResponsePacket());
    expect(out.indices).to.deep.equal([0, 1, 2]);
    expect(out.data).to.deep.equal(['{"array": []}', '{"a": 1}', '{}']);
  });

  it('BlacksmithRequestPacket reads a count + slot objects (no leftover)', () => {
    const reader = hexReader('010000024b000000030000200d');
    const p = new BlacksmithRequestPacket();
    p.read(reader);
    expect(p.slots).to.have.length(1);
    expect(p.slots[0].objectId).to.equal(587);
    expect(p.slots[0].slotId).to.equal(3);
    expect(p.slots[0].objectType).to.equal(0x0000200d);
    expect(reader.remaining).to.equal(0);
  });

  it('BlacksmithRequestPacket round trips', () => {
    const p = new BlacksmithRequestPacket();
    p.slots = [SlotObjectData.from(587, 5, 19264)];
    const out = roundTrip(p, new BlacksmithRequestPacket());
    expect(out.slots[0].objectId).to.equal(587);
    expect(out.slots[0].slotId).to.equal(5);
    expect(out.slots[0].objectType).to.equal(19264);
  });

  it('BlacksmithDismantlePacket reads success + count + emptied slots (no leftover)', () => {
    const reader = hexReader('01010000024b00000003ffffffff');
    const p = new BlacksmithDismantlePacket();
    p.read(reader);
    expect(p.success).to.equal(true);
    expect(p.slots).to.have.length(1);
    expect(p.slots[0].objectId).to.equal(587);
    expect(p.slots[0].slotId).to.equal(3);
    expect(p.slots[0].objectType).to.equal(-1); // empty slot (0xffffffff read signed)
    expect(reader.remaining).to.equal(0);
  });

  it('QuestFetchResponsePacket round trips the new int fields', () => {
    const quest = new QuestData();
    quest.id = '6608868294033408';
    quest.name = 'Celestial Model K999 Pet Stone Garment';
    quest.description = 'Exchange 40 Celestial Stones.';
    quest.expiration = '';
    quest.category = 9095;
    quest.unknownInt = 7;
    quest.requirements = [24772, 24772];
    quest.rewards = [50703];
    quest.completed = false;
    quest.itemOfChoice = true;
    quest.repeatable = false;

    const p = new QuestFetchResponsePacket();
    p.quests = [quest];
    p.nextRefreshPrice = 100;
    p.unknownInt = 2;

    const out = roundTrip(p, new QuestFetchResponsePacket());
    expect(out.quests).to.have.length(1);
    expect(out.quests[0].category).to.equal(9095);
    expect(out.quests[0].unknownInt).to.equal(7);
    expect(out.quests[0].requirements).to.deep.equal([24772, 24772]);
    expect(out.quests[0].rewards).to.deep.equal([50703]);
    expect(out.quests[0].itemOfChoice).to.equal(true);
    expect(out.nextRefreshPrice).to.equal(100);
    expect(out.unknownInt).to.equal(2);
  });

  it('RerollAllEnchantmentsPacket reads byte/short/short/byte (no leftover)', () => {
    const reader = hexReader('010003ffff00');
    const p = new RerollAllEnchantmentsPacket();
    p.read(reader);
    expect(p.unknownByte).to.equal(1);
    expect(p.unknownShort).to.equal(3);
    expect(p.unknownShort2).to.equal(-1);
    expect(p.unknownByte2).to.equal(0);
    expect(reader.remaining).to.equal(0);
  });

  it('RerollAllEnchantmentsPacket round trips', () => {
    const p = new RerollAllEnchantmentsPacket();
    p.unknownByte = 1;
    p.unknownShort = 3;
    p.unknownShort2 = -1;
    p.unknownByte2 = 0;
    const out = roundTrip(p, new RerollAllEnchantmentsPacket());
    expect(out.unknownByte).to.equal(1);
    expect(out.unknownShort).to.equal(3);
    expect(out.unknownShort2).to.equal(-1);
    expect(out.unknownByte2).to.equal(0);
  });

  it('RerollAllEnchantmentsPacket reads its optional mode byte', () => {
    const reader = hexReader('010008ffff0100');
    const p = new RerollAllEnchantmentsPacket();
    p.read(reader);
    expect(p.optionalByte).to.equal(1);
    expect(p.unknownByte2).to.equal(0);
    expect(reader.remaining).to.equal(0);
    const writer = new Writer();
    p.write(writer);
    expect(writer.buffer.subarray(0, writer.index).toString('hex')).to.equal('010008ffff0100');
  });

  it('EnchantPacket reads a single success byte (no leftover)', () => {
    const reader = hexReader('01');
    const p = new EnchantPacket();
    p.read(reader);
    expect(p.success).to.equal(true);
    expect(reader.remaining).to.equal(0);
  });

  it('SelectEntrancePacket reads a single int32 (no leftover)', () => {
    const reader = hexReader('ffffffff');
    const p = new SelectEntrancePacket();
    p.read(reader);
    expect(p.entranceId).to.equal(-1);
    expect(reader.remaining).to.equal(0);
  });

  it('BuyEmotePacket reads the emote type (no leftover)', () => {
    const reader = hexReader('00001432');
    const p = new BuyEmotePacket();
    p.read(reader);
    expect(p.emoteType).to.equal(5170);
    expect(reader.remaining).to.equal(0);
  });

  it('Unknown224Packet reads a single int32 (no leftover)', () => {
    const reader = hexReader('00000033');
    const p = new Unknown224Packet();
    p.read(reader);
    expect(p.unknownInt).to.equal(51);
    expect(reader.remaining).to.equal(0);
  });

  it('NotificationPacket effect 18 consumes int32 + short (no leftover)', () => {
    const reader = hexReader('1228000000330001');
    const p = new NotificationPacket();
    p.read(reader);
    expect(p.effect).to.equal(18);
    expect(p.extra).to.equal(40);
    expect(p.unknownInt).to.equal(51);
    expect(p.uiExtra).to.equal(1);
    expect(reader.remaining).to.equal(0);
  });

  it('NotificationPacket effect 18 round trips', () => {
    const p = new NotificationPacket();
    p.effect = 18;
    p.extra = 40;
    p.unknownInt = 51;
    p.uiExtra = 1;
    const out = roundTrip(p, new NotificationPacket());
    expect(out.effect).to.equal(18);
    expect(out.unknownInt).to.equal(51);
    expect(out.uiExtra).to.equal(1);
  });

  it('ChangeGuildRankPacket reads a byte rank (no leftover)', () => {
    const reader = hexReader('00034268610a'); // "Bha", rank 10
    const p = new ChangeGuildRankPacket();
    p.read(reader);
    expect(p.name).to.equal('Bha');
    expect(p.guildRank).to.equal(10);
    expect(reader.remaining).to.equal(0);
  });

  it('ChangeGuildRankPacket round trips', () => {
    const p = new ChangeGuildRankPacket();
    p.name = 'Vault';
    p.guildRank = 0;
    const out = roundTrip(p, new ChangeGuildRankPacket());
    expect(out.name).to.equal('Vault');
    expect(out.guildRank).to.equal(0);
  });

  it('ClaimMissionPacket reads int/int/byte/short (no leftover)', () => {
    const reader = hexReader('000000320000000201ffff');
    const p = new ClaimMissionPacket();
    p.read(reader);
    expect(p.unknownInt).to.equal(50);
    expect(p.unknownInt2).to.equal(2);
    expect(p.unknownByte).to.equal(1);
    expect(p.unknownShort).to.equal(-1);
    expect(reader.remaining).to.equal(0);
  });

  it('ClaimRewardsInfoPromptPacket reads id + byte + int array (no leftover)', () => {
    const reader = hexReader('0000ff2a02000300009411000094160000941b');
    const p = new ClaimRewardsInfoPromptPacket();
    p.read(reader);
    expect(p.promptId).to.equal(0x0000ff2a);
    expect(p.unknownByte).to.equal(2);
    expect(p.items).to.deep.equal([0x9411, 0x9416, 0x941b]);
    expect(reader.remaining).to.equal(0);
  });

  it('ClaimRewardsInfoRequestPacket round trips the prompt id', () => {
    // Captured C->S request; the server echoed 0x230c back in packet 170.
    const reader = hexReader('0000230c');
    const p = new ClaimRewardsInfoRequestPacket();
    p.read(reader);
    expect(p.promptId).to.equal(0x230c);
    expect(reader.remaining).to.equal(0);
  });

  it('QuestRedeemPacket parses item, slots, and current tail', () => {
    const hex = '0010363437353732323537393830343136300000b9090001000000d400000004000087ae0000';
    const reader = hexReader(hex);
    const p = new QuestRedeemPacket();
    p.read(reader);
    expect(p.questId).to.equal('6475722579804160');
    expect(p.item).to.equal(47369);
    expect(p.slots).to.have.length(1);
    expect(p.slots[0].objectId).to.equal(212);
    expect(p.slots[0].slotId).to.equal(4);
    expect(p.slots[0].objectType).to.equal(34734);
    expect(p.unknownShort).to.equal(0);
    expect(reader.remaining).to.equal(0);
    const writer = new Writer();
    p.write(writer);
    expect(writer.buffer.subarray(0, writer.index).toString('hex')).to.equal(hex);
  });

  it('ClaimRewardsInfoPromptPacket parses a captured prompt (echoed id)', () => {
    // Captured S->C response to a request for prompt 0xffd1: category byte 2,
    // three near-sequential reward ids.
    const reader = hexReader('0000ffd10200030000ffd60000ffd70000ffd8');
    const p = new ClaimRewardsInfoPromptPacket();
    p.read(reader);
    expect(p.promptId).to.equal(0xffd1);
    expect(p.unknownByte).to.equal(2);
    expect(p.items).to.deep.equal([0xffd6, 0xffd7, 0xffd8]);
    expect(reader.remaining).to.equal(0);
  });

  it('RedeemVoucherPacket / VoucherResultPacket parse the voucher flow (no leftover)', () => {
    const req = hexReader('000c766f75636865725f636f6465'); // "voucher_code"
    const rp = new RedeemVoucherPacket();
    rp.read(req);
    expect(rp.code).to.equal('voucher_code');
    expect(req.remaining).to.equal(0);

    const res = hexReader('000018566f7563686572732e566f75636865724e6f744578697374000c766f75636865725f636f6465');
    const vp = new VoucherResultPacket();
    vp.read(res);
    expect(vp.success).to.equal(false);
    expect(vp.result).to.equal('Vouchers.VoucherNotExist');
    expect(vp.code).to.equal('voucher_code');
    expect(res.remaining).to.equal(0);
  });

  it('account-level reward packets parse the captured claim', () => {
    const req = hexReader('0002312c0000000b'); // "1,", seq 11
    const p232 = new ClaimAccountLevelRewardPacket();
    p232.read(req);
    expect(p232.selectedChoiceSlots).to.equal('1,');
    expect(p232.accountLevel).to.equal(11);
    expect(req.remaining).to.equal(0);

    const res = hexReader('010b00146974656d3a426567696e6e657220576561706f6e'); // "item:Beginner Weapon"
    const p233 = new ClaimAccountLevelRewardResultPacket();
    p233.read(res);
    expect(p233.success).to.equal(true);
    expect(p233.accountLevel).to.equal(11);
    expect(p233.grantedRewardDescription).to.equal('item:Beginner Weapon');
    expect(res.remaining).to.equal(0);
  });

  it('ClaimRewardPacket / ClaimRewardResultPacket parse the XML reward claim', () => {
    const req = hexReader('01');
    const p234 = new ClaimRewardPacket();
    p234.read(req);
    expect(p234.unknownByte).to.equal(1);
    expect(req.remaining).to.equal(0);

    const res = hexReader('01000b3c53756363657373202f3e0000'); // byte + "<Success />" + short
    const p235 = new ClaimRewardResultPacket();
    p235.read(res);
    expect(p235.unknownByte).to.equal(1);
    expect(p235.xml).to.equal('<Success />');
    expect(p235.unknownShort).to.equal(0);
    expect(res.remaining).to.equal(0);
  });

  it('MapInfoPacket parses a Lost Halls boss room with dungeon modifiers (no leftover)', () => {
    const reader = hexReader(
      '0000010000000100000a4c6f73742048616c6c73000a4c6f73742048616c6c7300054e6578757340d57516' +
      '000000004100000000000000326a4e85c8000a362e31322e302e302e30000f000f0000000000003145585045' +
      '5249454e4345443b445241494e45445f343b53544f4e45424f53535f343b4845524f494344414d4147453b7c53ffff',
    );
    const p = new MapInfoPacket();
    p.read(reader);
    expect(p.name).to.equal('Lost Halls');
    expect(p.buildVersion).to.equal('6.12.0.0.0');
    expect(p.viewRadius).to.equal(15);
    expect(p.dungeonModifier).to.equal('EXPERIENCED;DRAINED_4;STONEBOSS_4;HEROICDAMAGE;|S');
    expect(reader.remaining).to.equal(0);
  });

  it('ClaimMissionResultPacket (id 164) reads byte/byte/short (no leftover)', () => {
    const reader = hexReader('01010000');
    const p = new ClaimMissionResultPacket();
    p.read(reader);
    expect(p.unknownByte).to.equal(1);
    expect(p.unknownByte2).to.equal(1);
    expect(p.unknownShort).to.equal(0);
    expect(reader.remaining).to.equal(0);
  });

  it('CreatePacket reads the seasonal + trailing bytes (no leftover)', () => {
    // Captured C->S CREATE for a seasonal character: class 782, skin 0,
    // isChallenger=false, then the two trailing bytes 01 01.
    const reader = hexReader('030e0000000101');
    const p = new CreatePacket();
    p.read(reader);
    expect(p.classType).to.equal(0x030e);
    expect(p.skinType).to.equal(0);
    expect(p.isChallenger).to.equal(false);
    expect(p.isSeasonal).to.equal(true);
    expect(p.unknownByte).to.equal(1);
    expect(reader.remaining).to.equal(0);
    // round-trips byte-for-byte
    const w = new Writer(); p.write(w);
    expect(w.buffer.subarray(0, w.index).toString('hex')).to.equal('030e0000000101');
  });

  it('SlotObjectData round-trips an empty slot (objectType -1)', () => {
    // Empty slot is -1 on the wire; must read as -1 and write back the same
    // bytes (reading it unsigned then writing signed used to throw).
    const hex = '0000024900000002ffffffff'; // objectId=585, slotId=2, objectType=-1
    const reader = hexReader(hex);
    const s = new SlotObjectData();
    s.read(reader);
    expect(s.objectType).to.equal(-1);
    const w = new Writer(); s.write(w);
    expect(w.buffer.subarray(0, w.index).toString('hex')).to.equal(hex);
  });

  it('NotificationPacket effect 9 reads a JSON-key message (no leftover)', () => {
    // Captured S->C: effect 9, extra 2, then the JSON string. Previously
    // unhandled, so 37 bytes were left unread.
    const json = '{"k":"s.teleport_target_not_found"}';
    const w = new Writer();
    w.writeByte(9); w.writeByte(2); w.writeString(json);
    const reader = hexReader(w.buffer.subarray(0, w.index).toString('hex'));
    const p = new NotificationPacket();
    p.read(reader);
    expect(p.effect).to.equal(9);
    expect(p.message).to.equal(json);
    expect(reader.remaining).to.equal(0);
  });

  it('EmotePacket (id 159) reads int32/int32/byte (no leftover)', () => {
    const reader = hexReader('00001432000ab8d501');
    const p = new EmotePacket();
    p.read(reader);
    expect(p.emoteType).to.equal(0x1432);
    expect(p.time).to.equal(0x000ab8d5);
    expect(p.unknownByte).to.equal(1);
    expect(reader.remaining).to.equal(0);
    const w = new Writer(); p.write(w);
    expect(w.buffer.subarray(0, w.index).toString('hex')).to.equal('00001432000ab8d501');
  });

  it('StatsPacket (id 139) reads compressed id + two int32 (no leftover)', () => {
    const reader = hexReader('a395180000000000000000');
    const p = new StatsPacket();
    p.read(reader);
    expect(p.objectId).to.equal(197987);
    expect(p.unknownInt1).to.equal(0);
    expect(p.unknownInt2).to.equal(0);
    expect(reader.remaining).to.equal(0);
    const w = new Writer(); p.write(w);
    expect(w.buffer.subarray(0, w.index).toString('hex')).to.equal('a395180000000000000000');
  });

  it('InvResultPacket: a swap acknowledgement (ackType 0)', () => {
    // Captured S->C ack of a client swap: item 2991 into obj 55602 slot 4.
    const hex = '01000000d93300000000ffffffff0000d9320000000400000baf0000000000000000';
    const reader = hexReader(hex);
    const p = new InvResultPacket();
    p.read(reader);
    expect(p.success).to.equal(true);
    expect(p.ackType).to.equal(0);
    expect(p.fromSlot.objectId).to.equal(55603);
    expect(p.toSlot.objectId).to.equal(55602);
    expect(p.toSlot.objectType).to.equal(2991);
    expect(p.flags).to.equal(0);
    expect(reader.remaining).to.equal(0);
    const w = new Writer(); p.write(w);
    expect(w.buffer.subarray(0, w.index).toString('hex')).to.equal(hex);
  });

  it('InvResultPacket: a use acknowledgement (ackType 1, flags 0x1000)', () => {
    // Captured S->C ack of a USEITEM: the Rogue cloak (item 2648, obj 1194
    // slot 1) was activated. toSlot is the null slot but flags != 0 marks the
    // use as non-consuming — the cloak stays equipped.
    const hex = '0101000004aa0000000100000a580000000000000000000000000000100000000000';
    const reader = hexReader(hex);
    const p = new InvResultPacket();
    p.read(reader);
    expect(p.success).to.equal(true);
    expect(p.ackType).to.equal(1);
    expect(p.fromSlot.objectId).to.equal(1194);
    expect(p.fromSlot.objectType).to.equal(2648);
    expect(p.toSlot.objectId).to.equal(0); // null slot: "item left the slot"
    expect(p.flags).to.equal(0x1000); // ...but non-consuming, so it didn't
    expect(reader.remaining).to.equal(0);
    const w = new Writer(); p.write(w);
    expect(w.buffer.subarray(0, w.index).toString('hex')).to.equal(hex);
  });
});
