import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to the server to request crucible information. The body is a
 * short-length-prefixed array of int32 indices (observed as `[0, 1, 2]`);
 * the server echoes these back in the {@link CrucibleResponsePacket} along
 * with a JSON blob for each requested index.
 */
export class CrucibleRequestPacket implements Packet {

  readonly type = PacketType.CRUCIBLE_REQUEST;

  //#region packet-specific members
  /**
   * The crucible indices being requested.
   */
  indices: number[];
  //#endregion

  constructor() {
    this.indices = [];
  }

  read(reader: Reader): void {
    const count = reader.readUnsignedShort();
    this.indices = new Array<number>(count);
    for (let i = 0; i < count; i++) {
      this.indices[i] = reader.readInt32();
    }
  }

  write(writer: Writer): void {
    writer.writeUnsignedShort(this.indices.length);
    for (const index of this.indices) {
      writer.writeInt32(index);
    }
  }
}
