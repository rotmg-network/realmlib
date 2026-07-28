import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * > Unknown.
 */
export class SquareHitPacket implements Packet {
  readonly type = PacketType.SQUAREHIT;

  //#region packet-specific members
  /**
   * The current client time.
   */
  time: number;
  /**
   * > Unknown.
   */
  bulletId: number;
  /**
   * > Unknown.
   */
  objectId: number;
  //#endregion

  constructor() {
    this.time = 0;
    this.bulletId = 0;
    this.objectId = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.time);
    // UNSIGNED: PLAYERSHOOT emits bulletId as a uint16 (0-65535), and the
    // server matches a hit to the shot by that id, so a hit packet must be
    // able to carry the same range. Reading it signed made every claim for
    // a bulletId above 32767 throw "int16 out of range" — silently losing
    // half of all hit claims. Identical bytes on the wire either way.
    writer.writeUnsignedShort(this.bulletId);
    writer.writeInt32(this.objectId);
  }

  read(reader: Reader): void {
    this.time = reader.readInt32();
    this.bulletId = reader.readUnsignedShort();
    this.objectId = reader.readInt32();
  }
}
