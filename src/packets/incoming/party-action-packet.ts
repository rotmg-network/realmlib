import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** A party action performed on/by a player (kick, promote, leave, ...). */
export class PartyActionPacket implements Packet {
  readonly type = PacketType.PARTY_ACTION;

  /** Object id of the player the action concerns. */
  playerId: number;
  /** Which action was performed. */
  actionId: number;

  constructor() { this.playerId = 0; this.actionId = 0; }

  read(reader: Reader): void {
    this.playerId = reader.readUnsignedShort();
    this.actionId = reader.readUnsignedByte();
  }

  write(writer: Writer): void {
    writer.writeUnsignedShort(this.playerId);
    writer.writeUnsignedByte(this.actionId);
  }
}
