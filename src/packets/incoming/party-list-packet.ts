import { PartyInfoData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** One page of the party browser listing. */
export class PartyListPacket implements Packet {
  readonly type = PacketType.PARTY_LIST_MESSAGE;

  /** Which page of the listing this is. */
  packetNumber: number;
  /** The advertised parties in this page. */
  parties: PartyInfoData[];

  constructor() { this.packetNumber = 0; this.parties = []; }

  read(reader: Reader): void {
    this.packetNumber = reader.readUnsignedByte();
    const count = reader.validateCollectionCount(reader.readShort(), 14, 'party list');
    this.parties = new Array(count);
    for (let i = 0; i < count; i++) {
      this.parties[i] = new PartyInfoData();
      this.parties[i].read(reader);
    }
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.packetNumber);
    writer.writeShort(this.parties.length);
    for (const p of this.parties) p.write(writer);
  }
}
