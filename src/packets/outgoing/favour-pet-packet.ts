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
  /** Object ID of the pet to follow. */
  petId: number;
  //#endregion

  constructor() {
    this.petId = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.petId);
  }

  read(reader: Reader): void {
    this.petId = reader.readInt32();
  }
}
