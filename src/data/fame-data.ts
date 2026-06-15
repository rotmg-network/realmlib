import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';

/**
 * A single fame bonus awarded on death, listed in the `DeathPacket`.
 */
export class FameData implements DataPacket {
  /** The name/description of the bonus. */
  name: string;
  /** The bonus rank. */
  rank: number;
  /** The fame awarded. */
  fame: number;

  constructor() {
    this.name = '';
    this.rank = 0;
    this.fame = 0;
  }

  read(reader: Reader): void {
    this.name = reader.readString();
    this.rank = reader.readCompressedInt();
    this.fame = reader.readCompressedInt();
  }

  write(writer: Writer): void {
    writer.writeString(this.name);
    writer.writeCompressedInt(this.rank);
    writer.writeCompressedInt(this.fame);
  }

  toString(): string {
    return `[FameData] ${this.name} (rank ${this.rank}): ${this.fame} fame`;
  }
}
