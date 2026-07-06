import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent when a dungeon is called out by a player. // todo: investigate further
 */
export class PlayerCalloutPacket implements Packet {

  readonly type = PacketType.PLAYER_CALLOUT;

  //#region packet-specific members
  /** The callout type (RealmShark: `caloutType`) — read before the object id. */
  calloutType: number;
  /** The object ID of the player calling out the dungeon. */
  playerObjId: number;
  //#endregion

  constructor() {
    this.calloutType = 0;
    this.playerObjId = 0;
  }

  write(writer: Writer): void {
    writer.writeByte(this.calloutType);
    writer.writeInt32(this.playerObjId);
  }

  read(reader: Reader): void {
    this.calloutType = reader.readByte();
    this.playerObjId = reader.readInt32();
  }
}
