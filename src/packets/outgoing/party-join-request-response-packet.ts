import { PartyResponse } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Accepts or declines another player's request to join a party.
 *
 * The client class is named `PartyJoinRequestResponse`; this shorter exported
 * name avoids colliding with realmlib's legacy incoming class name.
 */
export class PartyJoinResponsePacket implements Packet {
  readonly type = PacketType.PARTY_JOIN_REQUEST_RESPONSE;

  name: string;
  classId: number;
  skinId: number;
  state: PartyResponse;

  constructor() {
    this.name = '';
    this.classId = 0;
    this.skinId = 0;
    this.state = PartyResponse.None;
  }

  read(reader: Reader): void {
    this.name = reader.readString();
    this.classId = reader.readUnsignedShort();
    this.skinId = reader.readUnsignedShort();
    this.state = reader.readUnsignedByte() as PartyResponse;
  }

  write(writer: Writer): void {
    writer.writeString(this.name);
    writer.writeUnsignedShort(this.classId);
    writer.writeUnsignedShort(this.skinId);
    writer.writeUnsignedByte(this.state);
  }
}
