import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Tells the client that its dash can be used again. This packet has no body. */
export class DashResetPacket implements Packet {
  readonly type = PacketType.DASH_RESET;

  read(_reader: Reader): void {}

  write(_writer: Writer): void {}
}
