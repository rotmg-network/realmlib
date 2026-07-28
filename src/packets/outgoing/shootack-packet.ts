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
   * Number of `EnemyShootPacket` messages acknowledged by this packet.
   * Captured values are 1-4; zero is not a valid ordinary acknowledgement.
   */
  unknownShort: number;
  //#endregion

  constructor() {
    this.time = 0;
    this.unknownShort = 1;
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
