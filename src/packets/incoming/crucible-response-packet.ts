import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `CrucibleRequestPacket`. The body begins with the
 * requested int32 indices echoed back (short-length-prefixed), followed by a
 * short-length-prefixed array of JSON strings — one entry per requested index.
 * Each JSON blob describes the crucible data for that index, e.g.
 * `{"array": [{"id": "...", "title": "Dex from Beyond", "crucible": {...}}]}`.
 */
export class CrucibleResponsePacket implements Packet {

  readonly type = PacketType.CRUCIBLE_RESPONSE;

  //#region packet-specific members
  /**
   * The crucible indices echoed back from the request.
   */
  indices: number[];
  /**
   * The JSON payload for each requested index.
   */
  data: string[];
  //#endregion

  constructor() {
    this.indices = [];
    this.data = [];
  }

  read(reader: Reader): void {
    const indexCount = reader.readUnsignedShort();
    this.indices = new Array<number>(indexCount);
    for (let i = 0; i < indexCount; i++) {
      this.indices[i] = reader.readInt32();
    }

    const dataCount = reader.readUnsignedShort();
    this.data = new Array<string>(dataCount);
    for (let i = 0; i < dataCount; i++) {
      this.data[i] = reader.readString();
    }
  }

  write(writer: Writer): void {
    writer.writeUnsignedShort(this.indices.length);
    for (const index of this.indices) {
      writer.writeInt32(index);
    }

    writer.writeUnsignedShort(this.data.length);
    for (const entry of this.data) {
      writer.writeString(entry);
    }
  }
}
