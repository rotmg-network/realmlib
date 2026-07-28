import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Sent to accept or decline a party invite. */
export class PartyInviteResponsePacket implements Packet {
  readonly type = PacketType.PARTY_INVITE_RESPONSE;

  /** Id of the party the invite was for. */
  partyId: number;
  /** Non-zero to accept the invite. */
  accept: number;

  constructor() {
    this.partyId = 0;
    this.accept = 0;
  }

  read(reader: Reader): void {
    this.partyId = reader.readUInt32();
    this.accept = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeUInt32(this.partyId);
    writer.writeByte(this.accept);
  }
}
