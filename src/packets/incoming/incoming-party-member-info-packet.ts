import { PartyPlayerData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Full state of the party you are in: roster, capacity and description. */
export class IncomingPartyMemberInfoPacket implements Packet {
  readonly type = PacketType.INCOMING_PARTY_MEMBER_INFO;

  /** Id of the party. */
  partyId: number;
  /** Unknown leading short. */
  unknownShort: number;
  /** Maximum number of members the party allows. */
  maxSize: number;
  /** The current members of the party. */
  partyPlayers: PartyPlayerData[];
  /** Party description. */
  description: string;

  constructor() {
    this.partyId = 0;
    this.unknownShort = 0;
    this.maxSize = 0;
    this.partyPlayers = [];
    this.description = '';
  }

  read(reader: Reader): void {
    this.partyId = reader.readUInt32();
    this.unknownShort = reader.readUnsignedShort();
    this.maxSize = reader.readUnsignedByte();
    const count = reader.validateCollectionCount(reader.readShort(), 8, 'party members');
    this.partyPlayers = new Array(count);
    for (let i = 0; i < count; i++) {
      this.partyPlayers[i] = new PartyPlayerData();
      this.partyPlayers[i].read(reader);
    }
    this.description = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeUInt32(this.partyId);
    writer.writeUnsignedShort(this.unknownShort);
    writer.writeUnsignedByte(this.maxSize);
    writer.writeShort(this.partyPlayers.length);
    for (const p of this.partyPlayers) p.write(writer);
    writer.writeString(this.description);
  }
}
