import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent in response to a `MapInfoPacket` to load a character into the map.
 */
export class LoadPacket implements Packet {

  readonly type = PacketType.LOAD;

  //#region packet-specific members
  /**
   * The id of the character to load.
   */
  charId: number;
  /**
   * Whether or not the `MapInfoPacket` being responded to is from the arena.
   */
  isFromArena: boolean;
  //#endregion

  constructor() {
    this.charId = 0;
    this.isFromArena = false;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.charId);
    writer.writeBoolean(this.isFromArena);
  }

  read(reader: Reader): void {
    this.charId = reader.readInt32();
    this.isFromArena = reader.readBoolean();
  }
}
