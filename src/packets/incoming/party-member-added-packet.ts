import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Sent when a new member joins the party you are in. */
export class PartyMemberAddedPacket implements Packet {
  readonly type = PacketType.PARTY_MEMBER_ADDED;

  /** Object id of the new member. */
  playerId: number;
  /** Display name of the new member. */
  name: string;
  /** Class (object type) they are playing. */
  classId: number;
  /** Skin/texture id. */
  skinId: number;

  constructor() { this.playerId = 0; this.name = ''; this.classId = 0; this.skinId = 0; }

  read(reader: Reader): void {
    this.playerId = reader.readUnsignedShort();
    this.name = reader.readString();
    this.classId = reader.readUnsignedShort();
    this.skinId = reader.readUnsignedShort();
  }

  write(writer: Writer): void {
    writer.writeUnsignedShort(this.playerId);
    writer.writeString(this.name);
    writer.writeUnsignedShort(this.classId);
    writer.writeUnsignedShort(this.skinId);
  }
}
