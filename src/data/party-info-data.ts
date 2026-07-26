import { Reader } from '../reader';
import { Writer } from '../writer';

/**
 * A single party as advertised in the party browser (`PARTY_LIST_MESSAGE`).
 */
export class PartyInfoData {
  /** Party name / description. */
  name: string;
  /** Unique id of the party. */
  partyId: number;
  /** Minimum power level the party requires. */
  powerLevelMin: number;
  /** How many members the party currently has. */
  partySizeCurrent: number;
  /** Maximum number of members the party allows. */
  partySizeMax: number;
  /** Activity the party is recruiting for. */
  activity: number;
  /** Privacy setting of the party. */
  privacy: number;
  /** Minimum maxed-stat requirement. */
  statsMin: number;
  /** Index of the server the party is on. */
  serverIndex: number;

  constructor() {
    this.name = '';
    this.partyId = 0;
    this.powerLevelMin = 0;
    this.partySizeCurrent = 0;
    this.partySizeMax = 0;
    this.activity = 0;
    this.privacy = 0;
    this.statsMin = 0;
    this.serverIndex = 0;
  }

  read(reader: Reader): void {
    this.name = reader.readString();
    this.partyId = reader.readUInt32();
    this.powerLevelMin = reader.readUnsignedShort();
    this.partySizeCurrent = reader.readUnsignedByte();
    this.partySizeMax = reader.readUnsignedByte();
    this.activity = reader.readUnsignedByte();
    this.privacy = reader.readUnsignedByte();
    this.statsMin = reader.readUnsignedByte();
    this.serverIndex = reader.readUnsignedByte();
  }

  write(writer: Writer): void {
    writer.writeString(this.name);
    writer.writeUInt32(this.partyId);
    writer.writeUnsignedShort(this.powerLevelMin);
    writer.writeUnsignedByte(this.partySizeCurrent);
    writer.writeUnsignedByte(this.partySizeMax);
    writer.writeUnsignedByte(this.activity);
    writer.writeUnsignedByte(this.privacy);
    writer.writeUnsignedByte(this.statsMin);
    writer.writeUnsignedByte(this.serverIndex);
  }
}
