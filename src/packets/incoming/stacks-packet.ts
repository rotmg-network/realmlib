import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { StacksState } from '../../data';

/**
 * Updates the local player's eight temporary base-stat stack counters.
 */
export class StacksPacket implements Packet {

  readonly type = PacketType.STACKS;

  /** HP/MP/attack/defense/speed/vitality/wisdom/dexterity stack counters. */
  state: StacksState;

  constructor() {
    this.state = new StacksState();
  }

  read(reader: Reader): void {
    this.state.read(reader);
  }

  write(writer: Writer): void {
    this.state.write(writer);
  }
}

/** @deprecated Use `StacksPacket`. */
export class Unknown231Packet extends StacksPacket {}
