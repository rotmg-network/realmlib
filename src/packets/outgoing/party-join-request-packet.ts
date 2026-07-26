import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Sent to request to join an advertised party. */
export class PartyJoinRequestPacket implements Packet {
  readonly type = PacketType.PARTY_JOIN_REQUEST;

  /** Id of the party to join. */
  partyId: number;
  /** Trailing byte. Purpose not yet confirmed. */
  unknownByte: number;

  constructor() { this.partyId = 0; this.unknownByte = 0; }

  read(reader: Reader): void {
    this.partyId = reader.readUInt32();
    this.unknownByte = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeUInt32(this.partyId);
    writer.writeByte(this.unknownByte);
  }
}
