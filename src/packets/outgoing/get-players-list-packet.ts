import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Requests the server's serialized online-player list. This packet has no body. */
export class GetPlayersListPacket implements Packet {
  readonly type = PacketType.GET_PLAYERS_LIST_MESSAGE;

  write(_writer: Writer): void {}

  read(_reader: Reader): void {}
}
