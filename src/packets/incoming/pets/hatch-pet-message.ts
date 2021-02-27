import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';

/**
 * Received to give the player information about a newly hatched pet
 */
export class HatchPetMessage implements Packet {

  readonly type = PacketType.HATCH_PET;
  propagate = true;

  /**
   * The name of the hatched pet
   */
  petName: string;
  /**
   * The skin id of the hatched pet
   */
  petSkin: number;
  /**
   * The object type of the pet
   */
  petType: number;

  constructor() {
    this.petName = '';
    this.petSkin = 0;
    this.petType = 0;
  }

  read(reader: Reader): void {
    this.petName = reader.readString();
    this.petSkin = reader.readInt32();
    this.petType = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeString(this.petName);
    writer.writeInt32(this.petSkin);
    writer.writeInt32(this.petType);
  }
}
