import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Supplies the server-name list used by the client's forced-reconnect flow
 * (packet 218).
 *
 * Although the managed field is `List<string>`, the wire carries one
 * colon-delimited UTF string. The client splits it and discards an empty first
 * element, allowing the server's leading-colon representation.
 */
export class ForReconnectPacket implements Packet {
  readonly type = PacketType.FOR_RECONNECT;

  serverNames: string[];
  /** Exact delimited string received from the wire. */
  encodedServerNames: string;

  constructor() {
    this.serverNames = [];
    this.encodedServerNames = '';
  }

  read(reader: Reader): void {
    this.encodedServerNames = reader.readString();
    this.serverNames = this.decodeServerNames(this.encodedServerNames);
  }

  write(writer: Writer): void {
    const encoded =
      this.encodedServerNames &&
      this.sameNames(this.serverNames, this.decodeServerNames(this.encodedServerNames))
        ? this.encodedServerNames
        : this.serverNames.join(':');
    writer.writeString(encoded);
  }

  private decodeServerNames(encoded: string): string[] {
    const names = encoded.split(':');
    if (names[0] === '') {
      names.shift();
    }
    return names;
  }

  private sameNames(left: string[], right: string[]): boolean {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }
}
