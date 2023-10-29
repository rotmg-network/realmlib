import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to teleport to another player.
 */
export class TeleportPacket implements Packet {

  readonly type = PacketType.TELEPORT;

  //#region packet-specific members
  /**
   * The object id of the player to teleport to.
   */
  objectId: number;
  //#endregion
  playerName: string

  constructor() {
    this.objectId = 0;
    this.playerName = '';
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectId);
    writer.writeString(this.playerName);
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
    this.playerName = reader.readString();
  }
}
