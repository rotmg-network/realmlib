import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';

/**
 * Received when the server sends the client a chat token to use (unnused)
 */
export class ChatToken implements Packet {
  readonly type = PacketType.CHATTOKEN;

  /**
   * The chat token for the current client
   */
  token: string;
  /**
   * The host address of the chat server
   */
  host: string;
  /**
   * The port of the chat server
   */
  port: number;

  constructor() {
    this.token = '';
    this.host = '';
    this.port = 0;
  }

  read(reader: Reader): void {
    this.token = reader.readString();
    this.host = reader.readString();
    this.port = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeString(this.token);
    writer.writeString(this.host);
    writer.writeInt32(this.port);
  }

  toString(): string {
    return `[ChatToken - 207] Token: ${this.token} - Host: ${this.host} - Port: ${this.port}`;
  }
}
