import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Incoming id 231, observed around activation and deactivation of a
 * multi-phase ability. Both fields remain raw int32 values until controlled
 * captures identify the first value and establish the full state range.
 */
export class Unknown231Packet implements Packet {

  readonly type = PacketType.UNKNOWN231;

  /** Unidentified int32; zero in every observed frame. */
  unknownInt: number;
  /** Ability-associated state; observed alternating between 1 and 0. */
  active: number;

  constructor() {
    this.unknownInt = 0;
    this.active = 0;
  }

  read(reader: Reader): void {
    this.unknownInt = reader.readInt32();
    this.active = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.unknownInt);
    writer.writeInt32(this.active);
  }
}
