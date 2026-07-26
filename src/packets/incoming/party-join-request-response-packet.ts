import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** The result of a request to join a party. */
export class PartyJoinRequestResponsePacket implements Packet {
  readonly type = PacketType.PARTY_REQUEST_RESPONSE;

  /** Name of the player who requested to join. */
  name: string;
  /** Class (object type) of that player. */
  classId: number;
  /** Skin/texture id of that player. */
  skinId: number;
  /** Outcome state of the request. */
  state: number;

  constructor() { this.name = ''; this.classId = 0; this.skinId = 0; this.state = 0; }

  read(reader: Reader): void {
    this.name = reader.readString();
    this.classId = reader.readUnsignedShort();
    this.skinId = reader.readUnsignedShort();
    this.state = reader.readUnsignedByte();
  }

  write(writer: Writer): void {
    writer.writeString(this.name);
    writer.writeUnsignedShort(this.classId);
    writer.writeUnsignedShort(this.skinId);
    writer.writeUnsignedByte(this.state);
  }
}
