import { PacketReadError } from '../../errors';
import { FavourPetOperation } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to set the account's favourite pet, or to favourite a title.
 *
 * The first byte is a CATEGORY discriminator, not a count -- see
 * {@link FavourPetOperation} for the evidence. Category 0 carries one int32 pet
 * instance id (-1 clears); category 2 carries the two title-slot ids (primary,
 * secondary) and mirrors the `RETITLE` sent just before it (the 19:40 session
 * shows `RETITLE 0000c89f00000fe3` then `FAVOUR_PET 02 0000c89f00000fe3`).
 * Unknown categories retain every complete trailing int32 for diagnostics.
 *
 * `values` is deliberately not called `petIds`: the category-2 form does not
 * carry a pet at all.
 */
export class FavourPetPacket implements Packet {

  readonly type = PacketType.FAVOUR_PET;

  //#region packet-specific members
  /** Category controlling the number and meaning of the trailing int32s. */
  operation: FavourPetOperation;
  /** The trailing int32s, whose meaning depends on `operation`. */
  values: number[];
  //#endregion

  constructor() {
    this.operation = FavourPetOperation.Pet;
    this.values = [];
  }

  /** Favourite a pet by instance id, or pass -1 to clear the favourite. */
  static pet(petInstanceId: number): FavourPetPacket {
    const packet = new FavourPetPacket();
    packet.operation = FavourPetOperation.Pet;
    packet.values = [petInstanceId];
    return packet;
  }

  /**
   * Favourite the equipped title pair. `secondaryTitleId` is 0 when only one
   * title slot is used. The pair mirrors the preceding {@link RetitlePacket}.
   */
  static title(titleId: number, secondaryTitleId = 0): FavourPetPacket {
    const packet = new FavourPetPacket();
    packet.operation = FavourPetOperation.Title;
    packet.values = [titleId, secondaryTitleId];
    return packet;
  }

  write(writer: Writer): void {
    const expectedCount = FavourPetPacket.expectedValueCount(this.operation);
    if (expectedCount !== null && this.values.length !== expectedCount) {
      throw new RangeError(
        `favourite category ${this.operation} requires ${expectedCount} value(s), got ${this.values.length}`,
      );
    }
    writer.writeUnsignedByte(this.operation);
    for (const value of this.values) {
      writer.writeInt32(value);
    }
  }

  read(reader: Reader): void {
    this.operation = reader.readUnsignedByte() as FavourPetOperation;
    const expectedCount = FavourPetPacket.expectedValueCount(this.operation);
    if (expectedCount === null && reader.remaining % 4 !== 0) {
      throw new PacketReadError(
        `favourite category ${this.operation} has ${reader.remaining} trailing byte(s), not complete int32s`,
      );
    }
    const count = expectedCount ?? reader.remaining / 4;
    reader.validateCollectionCount(count, 4, 'favourite values');
    this.values = new Array(count);
    for (let i = 0; i < count; i++) {
      this.values[i] = reader.readInt32();
    }
  }

  /** Trailing int32 count for a known category, or null if unknown. */
  private static expectedValueCount(operation: number): number | null {
    switch (operation) {
      case FavourPetOperation.Pet:
        return 1;
      case FavourPetOperation.Title:
        return 2;
      default:
        return null;
    }
  }
}
