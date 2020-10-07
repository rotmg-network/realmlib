import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * > Unknown
 */
export class NewCharacterInfoPacket implements Packet {

  readonly type = PacketType.NEW_CHAR_INFO;

  charXML: string;
  //#endregion

  constructor() {
    this.charXML = "";
  }

  read(reader: Reader): void {
    this.charXML = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.charXML);
  }
}
