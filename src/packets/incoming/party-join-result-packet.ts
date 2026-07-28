import { PartyResponse } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Server state update for a party join request. */
export class PartyJoinResultPacket implements Packet {
  readonly type = PacketType.PARTY_JOIN_RESULT;

  partyId: number;
  state: PartyResponse;

  constructor() {
    this.partyId = 0;
    this.state = PartyResponse.None;
  }

  read(reader: Reader): void {
    this.partyId = reader.readUInt32();
    this.state = reader.readUnsignedByte() as PartyResponse;
  }

  write(writer: Writer): void {
    writer.writeUInt32(this.partyId);
    writer.writeUnsignedByte(this.state);
  }
}
