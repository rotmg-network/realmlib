import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Unknown. More debugging required. Possibly admin only.
 */
export class GetPlayersListPacket implements Packet {

  readonly type = PacketType.GET_PLAYERS_LIST_MESSAGE;

  //#region packet-specific members
  /** Provisional: character class id. */
  classType: number;
  /** Provisional: skin id. */
  skinType: number;
  /** Provisional: challenger-mode flag. */
  isChallenger: boolean;
  //#endregion

  constructor() {
    this.classType = 0;
    this.skinType = 0;
    this.isChallenger = false;
  }

  write(writer: Writer): void {
    writer.writeShort(this.classType);
    writer.writeShort(this.skinType);
    writer.writeBoolean(this.isChallenger);
  }

  read(reader: Reader): void {
    this.classType = reader.readShort();
    this.skinType = reader.readShort();
    this.isChallenger = reader.readBoolean();
  }
}
