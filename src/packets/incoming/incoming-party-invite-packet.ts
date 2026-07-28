import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Received when another player invites you to their party. */
export class IncomingPartyInvitePacket implements Packet {
  readonly type = PacketType.INCOMING_PARTY_INVITE;

  /** Id of the party you were invited to. */
  partyId: number;
  /** Name of the player who sent the invite. */
  inviterName: string;

  constructor() {
    this.partyId = 0;
    this.inviterName = '';
  }

  read(reader: Reader): void {
    this.partyId = reader.readUInt32();
    this.inviterName = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeUInt32(this.partyId);
    writer.writeString(this.inviterName);
  }
}
