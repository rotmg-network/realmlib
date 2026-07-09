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
   * Whether or not the character is in challenger mode.
   */
  isChallenger: boolean;
  /**
   * Whether the new character is a seasonal character. Added in a recent build;
   * confirmed against the `<Seasonal>True</Seasonal>` a seasonal creation
   * produced in the following `NewCharacterInformation`.
   */
  isSeasonal: boolean;
  /**
   * A trailing byte added alongside `isSeasonal` (observed as 1). Meaning not
   * yet confirmed; read as a raw byte so any value round-trips.
   */
  unknownByte: number;
  //#endregion

  constructor() {
    this.classType = 0;
    this.skinType = 0;
    this.isChallenger = false;
    this.isSeasonal = false;
    this.unknownByte = 0;
  }

  write(writer: Writer): void {
    writer.writeShort(this.classType);
    writer.writeShort(this.skinType);
    writer.writeBoolean(this.isChallenger);
    writer.writeBoolean(this.isSeasonal);
    writer.writeByte(this.unknownByte);
  }

  read(reader: Reader): void {
    this.classType = reader.readShort();
    this.skinType = reader.readShort();
    this.isChallenger = reader.readBoolean();
    this.isSeasonal = reader.readBoolean();
    this.unknownByte = reader.readByte();
  }
}
