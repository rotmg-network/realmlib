import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to the server to mark one or more pets as favourites.
 *
 * The body is a **count byte followed by that many int32 pet ids** — not a
 * single id. Confirmed by the 2026-07-26 proxy capture, whose sample was
 * `02 00000fe2 00000fe3` (count 2, pets 4066 and 4067); reading a single id
 * left exactly one int32 unconsumed.
 */
export class FavourPetPacket implements Packet {

  readonly type = PacketType.FAVOUR_PET;

  //#region packet-specific members
  /** Object IDs of the pets to favour. */
  petIds: number[];
  //#endregion

  constructor() {
    this.petIds = [];
  }

  write(writer: Writer): void {
    writer.writeByte(this.petIds.length);
    for (const petId of this.petIds) {
      writer.writeInt32(petId);
    }
  }

  read(reader: Reader): void {
    const count = reader.validateCollectionCount(reader.readByte(), 4, 'favourite pets');
    this.petIds = new Array(count);
    for (let i = 0; i < count; i++) {
      this.petIds[i] = reader.readInt32();
    }
  }
}
