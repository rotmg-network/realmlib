import { PartyAction } from '../../models';
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
  actionId: PartyAction;

  constructor() {
    this.playerId = 0;
    this.actionId = PartyAction.None;
  }

  read(reader: Reader): void {
    this.playerId = reader.readUnsignedShort();
    this.actionId = reader.readUnsignedByte() as PartyAction;
  }

  write(writer: Writer): void {
    writer.writeUnsignedShort(this.playerId);
    writer.writeUnsignedByte(this.actionId);
  }
}
