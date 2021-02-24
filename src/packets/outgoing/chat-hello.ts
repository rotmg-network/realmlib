import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to initiate the chat stream (unnused)
 */
export class ChatHelloPacket implements Packet {

  readonly type = PacketType.CHATHELLO;

  /**
   * The clients account ID
   */
  accountId: string;
  /**
   * The chat initiation token
   */
  token: string;

  constructor() {
    this.accountId = "";
    this.token = "";
  }

  write(writer: Writer): void {
    writer.writeString(this.accountId);
    writer.writeString(this.token);
  }

  read(reader: Reader): void {
    this.accountId = reader.readString();
    this.token = reader.readString();
  }

  toString(): string {
    return `[ChatHello - 206] AccountId: ${this.accountId} - Token: ${this.token}`;
  }
}
