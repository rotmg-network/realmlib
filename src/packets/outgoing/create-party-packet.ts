import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Sent to create a new party with the given advertised settings. */
export class CreatePartyPacket implements Packet {
  readonly type = PacketType.CREATE_PARTY_MESSAGE;

  /** Party description shown in the browser. */
  description: string;
  /** Minimum power level required to join. */
  minPowerLevel: number;
  /** Maximum number of members. */
  maxPartySize: number;
  /** Activity the party is recruiting for. */
  activity: number;
  /** Minimum maxed-stat requirement. */
  maxedStatReq: number;
  /** Privacy setting. */
  privacy: number;
  /** Index of the server the party is on. */
  serverIndex: number;

  constructor() {
    this.description = '';
    this.minPowerLevel = 0;
    this.maxPartySize = 0;
    this.activity = 0;
    this.maxedStatReq = 0;
    this.privacy = 0;
    this.serverIndex = 0;
  }

  read(reader: Reader): void {
    this.description = reader.readString();
    this.minPowerLevel = reader.readShort();
    this.maxPartySize = reader.readByte();
    this.activity = reader.readByte();
    this.maxedStatReq = reader.readByte();
    this.privacy = reader.readByte();
    this.serverIndex = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeString(this.description);
    writer.writeShort(this.minPowerLevel);
    writer.writeByte(this.maxPartySize);
    writer.writeByte(this.activity);
    writer.writeByte(this.maxedStatReq);
    writer.writeByte(this.privacy);
    writer.writeByte(this.serverIndex);
  }
}
