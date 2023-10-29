import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to change the guild rank of a member in the player's guild.
 */
export class ChangeAllyShootPacket implements Packet {

  readonly type = PacketType.SHOW_ALLY_SHOOT;

  //#region packet-specific members
  /**
   * This is a toggle whether to show ally shoots or not 
   */
  toggle: number;
  //#endregion

  constructor() {
    this.toggle = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.toggle);
  }

  read(reader: Reader): void {
    this.toggle = reader.readInt32();
  }
}
