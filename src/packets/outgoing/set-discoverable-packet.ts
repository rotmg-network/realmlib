import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to toggle the account's discoverable state. Layout from the
 * 6.12.0.2.0 client binary (class `NDDPOJLAGII`, vtable id 167): a bool and
 * an adjacent int16 named `icon`. All 71 unique official captures use icon 1.
 */
export class SetDiscoverablePacket implements Packet {
  readonly type = PacketType.SET_DISCOVERABLE;

  //#region packet-specific members
  /** Whether the account should be discoverable. */
  discoverable: boolean;
  /** Icon selector sent with the discoverability state. */
  icon: number;
  //#endregion

  constructor() {
    this.discoverable = false;
    this.icon = 0;
  }

  /** @deprecated Use {@link SetDiscoverablePacket.icon}. */
  get unknownShort(): number {
    return this.icon;
  }

  set unknownShort(value: number) {
    this.icon = value;
  }

  read(reader: Reader): void {
    this.discoverable = reader.readBoolean();
    this.icon = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.discoverable);
    writer.writeShort(this.icon);
  }
}
