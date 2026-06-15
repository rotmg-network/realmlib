import { expect } from 'chai';
import {
  Reader,
  Writer,
  WorldPosData,
  FameData,
  AllyShootPacket,
  EnemyShootPacket,
  DamagePacket,
  DeathPacket,
  ExaltationUpdatePacket,
  MapInfoPacket,
  NotificationPacket,
  UpdatePacket,
} from '../src';

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
