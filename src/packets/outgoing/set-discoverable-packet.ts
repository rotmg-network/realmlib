import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to toggle the account's discoverable state. Layout from the
 * 6.12.0.2.0 client binary (class `NDDPOJLAGII`, vtable id 167): a bool and
 * an adjacent int16 whose field token appears nowhere else in the dump, so
 * its meaning is unknown. No wire capture exists yet.
 */
export class SetDiscoverablePacket implements Packet {

  readonly type = PacketType.SET_DISCOVERABLE;

  //#region packet-specific members
  /** Whether the account should be discoverable. */
  discoverable: boolean;
  /** A trailing short of unknown purpose. */
  unknownShort: number;
  //#endregion

  constructor() {
    this.discoverable = false;
    this.unknownShort = 0;
  }

  read(reader: Reader): void {
    this.discoverable = reader.readBoolean();
    this.unknownShort = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.discoverable);
    writer.writeShort(this.unknownShort);
  }
}
