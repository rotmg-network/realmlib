import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

export interface Unknown165PoolEntry {
  raw: string;
  values: number[];
}

/**
 * Current build packet 165. Observed in Nexus as a string payload such as:
 * `pool/50:55:103:1782400780|50:56:203:1782400780|#`.
 */
export class Unknown165Packet implements Packet {
  readonly type = PacketType.UNKNOWN165;

  value: string;
  prefix: string;
  entries: Unknown165PoolEntry[];

  constructor() {
    this.value = '';
    this.prefix = '';
    this.entries = [];
  }

  read(reader: Reader): void {
    this.value = reader.readString();
    this.parseValue();
  }

  write(writer: Writer): void {
    writer.writeString(this.value);
  }

  private parseValue(): void {
    const [prefix, rest = ''] = this.value.split('/', 2);
    this.prefix = prefix;
    this.entries = rest
      .split('|')
      .filter((part) => part.length > 0 && part !== '#')
      .map((part) => ({
        raw: part,
        values: part.split(':').map((value) => Number(value)).filter((value) => Number.isFinite(value)),
      }));
  }

  toString(): string {
    return `[Unknown165] ${this.value}`;
  }
}
