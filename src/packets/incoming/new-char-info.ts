import { CharacterData, parseCharacterXml } from '../../models/character-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when the server pushes a character's information — a single `<Char>`
 * XML document (the same schema the AppEngine `/char/list` returns). Use
 * {@link character} to parse it into structured {@link CharacterData}.
 */
export class NewCharacterInfoPacket implements Packet {

  readonly type = PacketType.NEW_CHARACTER_INFORMATION;

  charXML: string;

  constructor() {
    this.charXML = "";
  }

  /** The parsed character, or `undefined` if `charXML` has no `<Char>` block. */
  get character(): CharacterData | undefined {
    return parseCharacterXml(this.charXML);
  }

  read(reader: Reader): void {
    this.charXML = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.charXML);
  }

  toString(): string {
    return `[NewCharacterInfo] CharXML ${this.charXML}`;
  }
}
