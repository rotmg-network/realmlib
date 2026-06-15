import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { FameData } from '../../data';

/**
 * Received when a player dies.
 */
export class DeathPacket implements Packet {

  readonly type = PacketType.DEATH;

  /** The account id of the player who died. */
  accountId: string;
  /** The character id of the player who died. */
  charId: number;
  /** The cause of death. */
  killedBy: string;
  /** > Unknown */
  unknownInt: number;
  /** The fame earned by the character. */
  fameEarned: number;
  /** The account's level. */
  accountLevel: number;
  /** The account's XP. */
  accountXP: number;
  /** The fame bonuses awarded. */
  fameBonuses: FameData[];
  /** The character's packed PC stats. */
  pcStats: string;

  constructor() {
    this.accountId = '';
    this.charId = 0;
    this.killedBy = '';
    this.unknownInt = 0;
    this.fameEarned = 0;
    this.accountLevel = 0;
    this.accountXP = 0;
    this.fameBonuses = [];
    this.pcStats = '';
  }

  read(reader: Reader): void {
    this.accountId = reader.readString();
    this.charId = reader.readCompressedInt();
    this.killedBy = reader.readString();
    this.unknownInt = reader.readInt32();
    this.fameEarned = reader.readCompressedInt();
    this.accountLevel = reader.readCompressedInt();
    this.accountXP = reader.readCompressedInt();
    const bonusCount = reader.readCompressedInt();
    this.fameBonuses = new Array<FameData>(bonusCount);
    for (let i = 0; i < bonusCount; i++) {
      const bonus = new FameData();
      bonus.read(reader);
      this.fameBonuses[i] = bonus;
    }
    this.pcStats = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.accountId);
    writer.writeCompressedInt(this.charId);
    writer.writeString(this.killedBy);
    writer.writeInt32(this.unknownInt);
    writer.writeCompressedInt(this.fameEarned);
    writer.writeCompressedInt(this.accountLevel);
    writer.writeCompressedInt(this.accountXP);
    writer.writeCompressedInt(this.fameBonuses.length);
    for (const bonus of this.fameBonuses) {
      bonus.write(writer);
    }
    writer.writeString(this.pcStats);
  }

  toString(): string {
    return `[Death] ${this.accountId} char ${this.charId} killed by ${this.killedBy}, ${this.fameEarned} fame`;
  }
}
