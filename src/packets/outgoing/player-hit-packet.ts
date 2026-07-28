import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent when the player is hit.
 */
export class PlayerHitPacket implements Packet {
  readonly type = PacketType.PLAYERHIT;

  //#region packet-specific members
  /**
   * The id of the bullet which hit the player.
   */
  bulletId: number;
  /**
   * The object id of the enemy that hit the player.
   */
  objectId: number;
  //#endregion

  constructor() {
    this.bulletId = 0;
    this.objectId = 0;
  }

  write(writer: Writer): void {
    // UNSIGNED: PLAYERSHOOT emits bulletId as a uint16 (0-65535), and the
    // server matches a hit to the shot by that id, so a hit packet must be
    // able to carry the same range. Reading it signed made every claim for
    // a bulletId above 32767 throw "int16 out of range" — silently losing
    // half of all hit claims. Identical bytes on the wire either way.
    writer.writeUnsignedShort(this.bulletId);
    writer.writeInt32(this.objectId);
  }

  read(reader: Reader): void {
    this.bulletId = reader.readUnsignedShort();
    this.objectId = reader.readInt32();
  }
}
