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
    this.minPowerLevel = reader.readUnsignedShort();
    this.maxPartySize = reader.readUnsignedByte();
    this.activity = reader.readUnsignedByte();
    this.maxedStatReq = reader.readUnsignedByte();
    this.privacy = reader.readUnsignedByte();
    this.serverIndex = reader.readUnsignedByte();
  }

  write(writer: Writer): void {
    writer.writeString(this.description);
    writer.writeUnsignedShort(this.minPowerLevel);
    writer.writeUnsignedByte(this.maxPartySize);
    writer.writeUnsignedByte(this.activity);
    writer.writeUnsignedByte(this.maxedStatReq);
    writer.writeUnsignedByte(this.privacy);
    writer.writeUnsignedByte(this.serverIndex);
  }
}
