import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when an accelerator is added (packet 179).
 *
 * The current native type extends `AcceleratorUpdatedMessage`, so its body
 * starts with the inherited int32 value before the two added int32 fields.
 * The semantics of the latter fields remain intentionally raw.
 */
export class AcceleratorAddedPacket implements Packet {
  readonly type = PacketType.ACCELERATOR_ADDED;

  /** Inherited accelerator update value. */
  value: number;
  /** Raw native `AcceleratorType` enum ordinal. */
  acceleratorType: number;
  /** Unresolved trailing int32. */
  unknownInt: number;

  constructor() {
    this.value = 0;
    this.acceleratorType = 0;
    this.unknownInt = 0;
  }

  read(reader: Reader): void {
    this.value = reader.readInt32();
    this.acceleratorType = reader.readInt32();
    this.unknownInt = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.value);
    writer.writeInt32(this.acceleratorType);
    writer.writeInt32(this.unknownInt);
  }
}
