import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to prompt the server to accept the connection of an account
 * and reply with a `MapInfoPacket`.
 */
export class HelloPacket implements Packet {

  readonly type = PacketType.HELLO;

  /**
   * The current build version of RotMG.
   */
  buildVersion: string;
  /**
   * The id of the map to connect to.
   */
  gameId: number;
  /**
   * The access token from the AppEngine used to login
   */
  accessToken: string;
  /**
   * The key time of the `key` being used.
   */
  keyTime: number;
  /**
   * The key of the map to connect to.
   */
  key: number[];
  /**
   *  The platform the game is played on
   */
  gameNet: string;
  /**
   * The platform the game is played on
   */
  playPlatform: string;
  /**
   * > Unknown
   */
  platformToken: string;
  /**
   * > Unknown
   */
  userToken: string;
  /**
   * The client token (hwid) of the Unity client
   */
  clientToken: string;

  constructor() {
    this.buildVersion = '';
    this.gameId = 0;
    this.accessToken = '';
    this.keyTime = 0;
    this.key = [];
    this.gameNet = '';
    this.playPlatform = '';
    this.platformToken = '';
    this.userToken = '';
    this.clientToken = '';
  }

  write(writer: Writer): void {
    writer.writeString(this.buildVersion);
    writer.writeInt32(this.gameId);
    writer.writeString(this.accessToken);
    writer.writeInt32(this.keyTime);
    writer.writeByteArray(this.key);
    writer.writeString(this.gameNet);
    writer.writeString(this.playPlatform);
    writer.writeString(this.platformToken);
    writer.writeString(this.userToken);
    writer.writeString(this.clientToken);
  }

  read(reader: Reader): void {
    this.buildVersion = reader.readString();
    this.gameId = reader.readInt32();
    this.accessToken = reader.readString();
    this.keyTime = reader.readInt32();
    this.key = reader.readByteArray();
    this.gameNet = reader.readString();
    this.playPlatform = reader.readString();
    this.platformToken = reader.readString();
    this.userToken = reader.readString();
    this.clientToken = reader.readString();
  }

  toString(): string {
    return `[Hello - 1] BuildVersion: ${this.buildVersion}\n
    GameId: ${this.gameId}\n
    AccessToken: ${this.accessToken}\n
    KeyTime: ${this.keyTime}\n
    Key: ${this.key.toString()}\n
    GameNet: ${this.gameNet}\n
    PlayPlatform: ${this.playPlatform}\n
    PlatformToken: ${this.platformToken}\n
    UserToken: ${this.userToken}\n
    ClientToken: ${this.clientToken}`
  }
}
