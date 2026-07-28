import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Requests the account's custom-map list. This packet has no body. */
export class CustomMapListPacket implements Packet {
  readonly type = PacketType.CUSTOM_MAP_LIST;

  read(_reader: Reader): void {}

  write(_writer: Writer): void {}
}
