import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

export interface ProgressUpdateEntry {
  raw: string;
  values: number[];
}

/**
 * Current build packet 165 (S->C). A single length-prefixed string of the
 * form `<prefix>/<payload>`, sent a few times per session (nexus and inside
 * dungeons). Two prefixes observed:
 *
 * - `pool/50:55:103:1782400780|50:56:203:1782400780|#` — `|`-separated
 *   entries, each a `:`-separated tuple.
 * - `prog/51,1002,1` — a single `,`-separated tuple (progress-like).
 *
 * The payload is parsed leniently: split on `|` into entries, then each entry
 * on either `:` or `,` into numeric `values`. Semantics unconfirmed, so the
 * raw `value` is preserved and round-trips exactly.
 */
export class ProgressUpdatePacket implements Packet {
  readonly type: PacketType = PacketType.PROGRESS_UPDATE;

  value: string;
  prefix: string;
  entries: ProgressUpdateEntry[];

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
        values: part.split(/[:,]/).map((value) => Number(value)).filter((value) => Number.isFinite(value)),
      }));
  }

  toString(): string {
    return `[ProgressUpdate] ${this.value}`;
  }
}
