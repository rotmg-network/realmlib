import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received (server -> client). Reverse-engineered from many samples across two
 * sessions, all of the form `<objectId:compressed-int> 00000000 00000000` — a
 * compressed object id followed by two int32s that were always zero, so the
 * trailing fields' meanings are unconfirmed.
 */
export class StatsPacket implements Packet {

  readonly type = PacketType.STATS;

  //#region packet-specific members
  /** The object id the stats are for. */
  objectId: number;
  /** Trailing int32 (observed 0). */
  unknownInt1: number;
  /** Trailing int32 (observed 0). */
  unknownInt2: number;
  //#endregion

  constructor() {
    this.objectId = 0;
    this.unknownInt1 = 0;
    this.unknownInt2 = 0;
  }

  read(reader: Reader): void {
    this.objectId = reader.readCompressedInt();
    this.unknownInt1 = reader.readInt32();
    this.unknownInt2 = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeCompressedInt(this.objectId);
    writer.writeInt32(this.unknownInt1);
    writer.writeInt32(this.unknownInt2);
  }
}
