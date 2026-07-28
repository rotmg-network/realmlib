import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to `CUSTOM_MAP_DELETE` (129). Layout from the
 * 6.12.0.2.0 client binary (class `FELIABHADOD`, incoming factory id 130):
 * a single bool. Its handler's strings are "Test dungeon removed" /
 * "Something goes wrong, the dungeon still exist". No wire capture exists yet.
 */
export class CustomMapDeleteResponsePacket implements Packet {
  readonly type = PacketType.CUSTOM_MAP_DELETE_RESPONSE;

  //#region packet-specific members
  /** Whether the deletion succeeded. */
  result: boolean;
  //#endregion

  constructor() {
    this.result = false;
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
  }
}
