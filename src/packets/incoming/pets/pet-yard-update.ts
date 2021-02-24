import { PetYardType } from '../../../models';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';

/**
 * Received when the pet yard is updated to a new type of yard
 */
export class PetYardUpdate implements Packet {

  readonly type = PacketType.PETYARDUPDATE;

  /**
   * The type of the new yard
   */
  yardType: PetYardType;

  constructor() {
    this.yardType = 0;
  }

  read(reader: Reader): void {
    this.yardType = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.yardType);
  }

  toString(): string {
    return `[PetYardUpdate - 78] Yard Type: ${this.yardType}`;
  }
}
