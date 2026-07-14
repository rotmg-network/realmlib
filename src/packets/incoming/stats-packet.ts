import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received server-to-client for the active local class/object. The first
 * trailing int32 is correlated with class/ability state: controlled Kensei
 * captures use multiples of 256 from 0 through 1280, while Druid samples stay
 * zero. Its exact transition meaning is still unconfirmed. The second int32
 * remains zero in current captures.
 */
export class StatsPacket implements Packet {

  readonly type = PacketType.STATS;

  //#region packet-specific members
  /** The object id the stats are for. */
  objectId: number;
  /** Raw class/ability-state value; observed in increments of 256 on Kensei. */
  unknownInt1: number;
  /** Trailing int32 (observed 0). */
  unknownInt2: number;
  //#endregion

  constructor() {
    this.objectId = 0;
    this.unknownInt1 = 0;
    this.unknownInt2 = 0;
  }

  /**
   * Diagnostic view of `unknownInt1 / 256`. This exposes the captured step
   * pattern without assigning unproven gameplay semantics to the raw field.
   */
  get abilityStateUnits(): number {
    return this.unknownInt1 / 256;
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
