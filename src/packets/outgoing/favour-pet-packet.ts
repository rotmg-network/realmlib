import { PacketReadError } from '../../errors';
import { FavourPetOperation } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to update favourite-pet state.
 *
 * The first byte is an operation discriminator rather than a count. Current
 * captures contain `0 + one int32 pet id` and `2 + two int32 pet ids`.
 * Unknown operations retain every complete trailing int32 for diagnostics.
 */
export class FavourPetPacket implements Packet {

  readonly type = PacketType.FAVOUR_PET;

  //#region packet-specific members
  /** Wire operation controlling the number and meaning of the pet ids. */
  operation: FavourPetOperation;
  /** Object IDs of the pets to favour. */
  petIds: number[];
  //#endregion

  constructor() {
    this.operation = FavourPetOperation.SinglePet;
    this.petIds = [];
  }

  /** Builds the observed single-pet request form. */
  static single(petId: number): FavourPetPacket {
    const packet = new FavourPetPacket();
    packet.operation = FavourPetOperation.SinglePet;
    packet.petIds = [petId];
    return packet;
  }

  /** Builds the observed two-pet request form. */
  static pair(firstPetId: number, secondPetId: number): FavourPetPacket {
    const packet = new FavourPetPacket();
    packet.operation = FavourPetOperation.PetPair;
    packet.petIds = [firstPetId, secondPetId];
    return packet;
  }

  write(writer: Writer): void {
    const expectedCount = FavourPetPacket.expectedPetIdCount(this.operation);
    if (expectedCount !== null && this.petIds.length !== expectedCount) {
      throw new RangeError(
        `favourite-pet operation ${this.operation} requires ${expectedCount} pet id(s), got ${this.petIds.length}`,
      );
    }
    writer.writeUnsignedByte(this.operation);
    for (const petId of this.petIds) {
      writer.writeInt32(petId);
    }
  }

  read(reader: Reader): void {
    this.operation = reader.readUnsignedByte() as FavourPetOperation;
    const expectedCount = FavourPetPacket.expectedPetIdCount(this.operation);
    if (expectedCount === null && reader.remaining % 4 !== 0) {
      throw new PacketReadError(
        `favourite-pet operation ${this.operation} has ${reader.remaining} trailing byte(s), not complete int32 ids`,
      );
    }
    const count = expectedCount ?? reader.remaining / 4;
    reader.validateCollectionCount(count, 4, 'favourite-pet ids');
    this.petIds = new Array(count);
    for (let i = 0; i < count; i++) {
      this.petIds[i] = reader.readInt32();
    }
  }

  /** Returns the number of pet IDs in a known operation, or null if unknown. */
  private static expectedPetIdCount(operation: number): number | null {
    switch (operation) {
      case FavourPetOperation.SinglePet:
        return 1;
      case FavourPetOperation.PetPair:
        return 2;
      default:
        return null;
    }
  }
}
