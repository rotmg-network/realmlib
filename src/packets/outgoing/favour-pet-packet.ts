import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to the server when the player wants a pet to follow.
 */
export class FavourPetPacket implements Packet {

  readonly type = PacketType.FAVOUR_PET;

  //#region packet-specific members
  /**
   * A leading byte preceding the pet id. Purpose not yet confirmed
   * (observed as 0 in the only sample).
   */
  unknownByte: number;
  /** Object ID of the pet to follow, or -1 to clear the favourite. */
  petId: number;
  //#endregion

  constructor() {
    this.unknownByte = 0;
    this.petId = 0;
  }

  write(writer: Writer): void {
    writer.writeByte(this.unknownByte);
    writer.writeInt32(this.petId);
  }

  read(reader: Reader): void {
    this.unknownByte = reader.readByte();
    this.petId = reader.readInt32();
  }
}
