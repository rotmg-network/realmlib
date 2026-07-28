import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received on an accelerator (boost) change. Layout from the 6.12.0.2.0
 * client binary (class `NHFGADLNGKK`, incoming factory id 153): a single
 * int32, handled by `AcceleratorsManager`. The catalog has both
 * `AcceleratorUpdatedMessage` and `AcceleratorAddedMessage` and the dump
 * cannot separate them; 153 is registered as "updated" because its sibling
 * 179 (which extends this class with an accelerator type + int32) looks like
 * the richer "added" form. Treat the name as tentative.
 */
export class AcceleratorUpdatedPacket implements Packet {
  readonly type = PacketType.ACCELERATOR_UPDATED;

  //#region packet-specific members
  /** The single int32 body; likely an accelerator id or remaining time. */
  value: number;
  //#endregion

  constructor() {
    this.value = 0;
  }

  read(reader: Reader): void {
    this.value = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.value);
  }
}
