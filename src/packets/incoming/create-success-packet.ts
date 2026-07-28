import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `CreatePacket`
 */
export class CreateSuccessPacket implements Packet {
  readonly type = PacketType.CREATE_SUCCESS;

  /**
   * The object id of the player's character
   */
  objectId: number;
  /**
   * The character id of the player's character
   */
  charId: number;
  /** Opaque player-stat payload named `PCStat` by the current client. */
  PCStat: string;
  constructor() {
    this.objectId = 0;
    this.charId = 0;
    this.PCStat = '';
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
    this.charId = reader.readInt32();
    this.PCStat = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectId);
    writer.writeInt32(this.charId);
    writer.writeString(this.PCStat);
  }

  toString(): string {
    return `[CreateSuccess] ObjectId: ${this.objectId} - CharId: ${this.charId}`;
  }
}
