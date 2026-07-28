import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to delete a custom (test) dungeon map. Layout from the 6.12.0.2.0
 * client binary (class `HKNJAKHDJMG`, vtable id 129): a single int32 map id.
 * The server answers with `CUSTOM_MAP_DELETE_RESPONSE` (130) — its handler's
 * strings are "Test dungeon removed" / "Something goes wrong, the dungeon
 * still exist".
 */
export class CustomMapDeletePacket implements Packet {
  readonly type = PacketType.CUSTOM_MAP_DELETE;

  //#region packet-specific members
  /** Id of the custom map to delete. */
  mapId: number;
  //#endregion

  constructor() {
    this.mapId = 0;
  }

  read(reader: Reader): void {
    this.mapId = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.mapId);
  }
}
