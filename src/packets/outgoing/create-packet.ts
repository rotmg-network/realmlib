import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to create a new character.
 */
export class CreatePacket implements Packet {

  readonly type = PacketType.CREATE;

  //#region packet-specific members
  /**
   * The class to use for the new character.
   */
  classType: number;
  /**
   * The skin id to use for the new character.
   * The default skin id is `0`.
   */
  skinType: number;
  /**
   * First flag after the class and skin. It was previously called challenger,
   * but every captured CREATE sends zero and no contrasting result establishes
   * that meaning. Kept raw until a controlled capture identifies it.
   */
  unknownFlag: boolean;
  /**
   * Whether the new character is seasonal. Confirmed by paired CREATE captures
   * which differ only here (`00 00 01` versus `00 01 01`) and return matching
   * `<Seasonal>False</Seasonal>` / `<Seasonal>True</Seasonal>` character XML.
   */
  isSeasonal: boolean;
  /**
   * Final flag byte. All current captures send 1, so its meaning is unknown.
   * It remains numeric rather than boolean to preserve any future raw value.
   */
  unknownFlag2: number;
  //#endregion

  constructor() {
    this.classType = 0;
    this.skinType = 0;
    this.unknownFlag = false;
    this.isSeasonal = false;
    this.unknownFlag2 = 0;
  }

  write(writer: Writer): void {
    writer.writeShort(this.classType);
    writer.writeShort(this.skinType);
    writer.writeBoolean(this.unknownFlag);
    writer.writeBoolean(this.isSeasonal);
    writer.writeByte(this.unknownFlag2);
  }

  read(reader: Reader): void {
    this.classType = reader.readShort();
    this.skinType = reader.readShort();
    this.unknownFlag = reader.readBoolean();
    this.isSeasonal = reader.readBoolean();
    this.unknownFlag2 = reader.readByte();
  }
}
