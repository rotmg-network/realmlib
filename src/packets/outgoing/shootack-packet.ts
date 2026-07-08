import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to acknowledge an `EnemyShootPacket`.
 */
export class ShootAckPacket implements Packet {

  type = PacketType.SHOOTACK;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * A trailing short added in the current build (observed values 1-4).
   * Purpose not yet confirmed.
   */
  unknownShort: number;
  //#endregion

  constructor() {
    this.time = 0;
    this.unknownShort = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
    writer.writeShort(this.unknownShort);
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
    this.unknownShort = reader.readShort();
  }
}
