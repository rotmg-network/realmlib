import { Reader } from '../reader';
import { Writer } from '../writer';

/**
 * One member of a party, as carried by `INCOMING_PARTY_MEMBER_INFO`.
 */
export class PartyPlayerData {
  /** Object id of the player. */
  playerId: number;
  /** Display name of the player. */
  name: string;
  /** Class (object type) the player is currently playing. */
  classId: number;
  /** Skin/texture id of the player. */
  skinId: number;

  constructor() {
    this.playerId = 0;
    this.name = '';
    this.classId = 0;
    this.skinId = 0;
  }

  read(reader: Reader): void {
    this.playerId = reader.readUnsignedShort();
    this.name = reader.readString();
    this.classId = reader.readUnsignedShort();
    this.skinId = reader.readUnsignedShort();
  }

  write(writer: Writer): void {
    writer.writeUnsignedShort(this.playerId);
    writer.writeString(this.name);
    writer.writeUnsignedShort(this.classId);
    writer.writeUnsignedShort(this.skinId);
  }
}
