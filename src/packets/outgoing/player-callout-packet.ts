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
  /** The object ID of the player calling out the dungeon. */
  playerObjId: number;
  /** Unknown. */
  unknownByte: number;
  //#endregion

  constructor() {
    this.playerObjId = 0;
    this.unknownByte = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.playerObjId);
    writer.writeByte(this.unknownByte);
  }

  read(reader: Reader): void {
    this.playerObjId = reader.readInt32();
    this.unknownByte = reader.readByte();
  }
}
