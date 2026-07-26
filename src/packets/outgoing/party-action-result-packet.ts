import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Sent to perform a party action on a member (kick, promote, leave, ...). */
export class PartyActionResultPacket implements Packet {
  readonly type = PacketType.PARTY_ACTION_RESULT;

  /** Object id of the target player. 65535 when the action has no target. */
  playerId: number;
  /** Which action to perform. */
  actionId: number;

  constructor() { this.playerId = 65535; this.actionId = 0; }

  read(reader: Reader): void {
    this.playerId = reader.readShort();
    this.actionId = reader.readByte();
  }

  write(writer: Writer): void {
    writer.writeShort(this.playerId);
    writer.writeByte(this.actionId);
  }
}
