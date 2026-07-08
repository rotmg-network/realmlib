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

  it('BlacksmithRequestPacket reads a byte + slot object (no leftover)', () => {
    const reader = hexReader('010000024b000000030000200d');
    const p = new BlacksmithRequestPacket();
    p.read(reader);
    expect(p.unknownByte).to.equal(1);
    expect(p.slotObject.objectId).to.equal(587);
    expect(p.slotObject.slotId).to.equal(3);
    expect(p.slotObject.objectType).to.equal(0x0000200d);
    expect(reader.remaining).to.equal(0);
  });

  it('BlacksmithRequestPacket round trips', () => {
    const p = new BlacksmithRequestPacket();
    p.unknownByte = 1;
    p.slotObject.objectId = 587;
    p.slotObject.slotId = 5;
    p.slotObject.objectType = 19264;
    const out = roundTrip(p, new BlacksmithRequestPacket());
    expect(out.unknownByte).to.equal(1);
    expect(out.slotObject.objectId).to.equal(587);
    expect(out.slotObject.slotId).to.equal(5);
    expect(out.slotObject.objectType).to.equal(19264);
  });

  it('BlacksmithDismantlePacket reads two bytes + emptied slot (no leftover)', () => {
    const reader = hexReader('01010000024b00000003ffffffff');
    const p = new BlacksmithDismantlePacket();
    p.read(reader);
    expect(p.unknownByte).to.equal(1);
    expect(p.unknownByte2).to.equal(1);
    expect(p.slotObject.objectId).to.equal(587);
    expect(p.slotObject.slotId).to.equal(3);
    expect(p.slotObject.objectType).to.equal(0xffffffff); // -1 -> empty slot
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
});
