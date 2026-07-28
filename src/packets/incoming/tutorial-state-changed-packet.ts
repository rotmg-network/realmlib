import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Signals that tutorial state changed. The current packet has no body. */
export class TutorialStateChangedPacket implements Packet {
  readonly type = PacketType.TUTORIAL_STATE_CHANGED;

  read(_reader: Reader): void {}

  write(_writer: Writer): void {}
}
