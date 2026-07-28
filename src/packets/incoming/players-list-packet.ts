import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Server response containing the serialized online-player list. */
export class PlayersListPacket implements Packet {
  readonly type = PacketType.PLAYERS_LIST_MESSAGE;

  playersList: string;

  constructor() {
    this.playersList = '';
  }

  read(reader: Reader): void {
    this.playersList = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeString(this.playersList);
  }
}
