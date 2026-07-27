import { PartyActionResult } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Sent to acknowledge the result of a server-requested party action. */
export class PartyActionResultPacket implements Packet {
  readonly type = PacketType.PARTY_ACTION_RESULT;

  /** Object id of the target player. 65535 when the action has no target. */
  playerId: number;
  /** Result of the requested action. */
  actionId: PartyActionResult;

  constructor() { this.playerId = 65535; this.actionId = PartyActionResult.None; }

  read(reader: Reader): void {
    this.playerId = reader.readUnsignedShort();
    this.actionId = reader.readUnsignedByte() as PartyActionResult;
  }

  write(writer: Writer): void {
    writer.writeUnsignedShort(this.playerId);
    writer.writeUnsignedByte(this.actionId);
  }
}
