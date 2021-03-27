import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to instruct the client to connect to a new host
 */
export class ReconnectPacket implements Packet {

  readonly type = PacketType.RECONNECT;

  /**
   * The name of the new host.
   */
  name: string;
  /**
   * The address of the new host
   */
  host: string;
  /**
   * The port of the new host
   */
  port: number;
  /**
   * The `gameId` to send in the next `HelloPacket`
   */
  gameId: number;
  /**
   * The `keyTime` to send in the next `HelloPacket`
   */
  keyTime: number;
  /**
   * The `key` to send in the next `HelloPacket`
   */
  key: number[];
  /**
   * Whether or not the new host is from the arena
   */
  isFromArena: boolean;

  constructor() {
    this.name = '';
    this.host = '';
    this.port = 0;
    this.gameId = 0;
    this.keyTime = 0;
    this.key = [];
    this.isFromArena = false;
  }

  read(reader: Reader): void {
    this.name = reader.readString();
    this.host = reader.readString();
    this.port = reader.readInt32();
    this.gameId = reader.readInt32();
    this.keyTime = reader.readInt32();
    this.isFromArena = reader.readBoolean();
    this.key = reader.readByteArray();
  }

  write(writer: Writer): void {
    writer.writeString(this.name);
    writer.writeString(this.host);
    writer.writeInt32(this.port);
    writer.writeInt32(this.gameId);
    writer.writeInt32(this.keyTime);
    writer.writeBoolean(this.isFromArena);
    writer.writeByteArray(this.key);
  }

  toString(): string {
    return `[Reconnect] Name: ${this.name}\n
    Host: ${this.host} - Port: ${this.port}\n
    GameId: ${this.gameId}\n
    KeyTime: ${this.keyTime}\n
    FromArena: ${this.isFromArena}\n
    Key: ${this.key.toString()}`;
  }
}
