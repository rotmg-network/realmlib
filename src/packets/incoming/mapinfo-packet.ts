import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to the `HelloPacket`
 */
export class MapInfoPacket implements Packet {

  readonly type = PacketType.MAPINFO;

  /**
   * The width of the map
   */
  width: number;
  /**
   * The height of the map
   */
  height: number;
  /**
   * The name of the map
   */
  name: string;
  /**
   * > Unknown.
   */
  displayName: string;
  /**
   * The name of the realm
   */
  realmName: string;
  /**
   * The seed value for the client's PRNG
   */
  fp: number;
  /**
   * > Unknown
   */
  background: number;
  /**
   * The difficulty rating of the map
   */
  difficulty: number;
  /**
   * Whether or not players can teleport in the map
   */
  allowPlayerTeleport: boolean;
  /**
   * > Unknown
   */
  showDisplays: boolean;
  /**
   * The number of players allowed in this map
   */
  maxPlayers: number;
  /**
   * The time the connection to the game was started
   */
  gameOpenedTime: number;
  /**
   * Some New Bool
   */
  newBool: boolean;
  /**
   * Build Version
   */
  buildVersion: string;
  /**
   * new Int 
   */
  newInt: number;
  /**
   * Dungeun modifiers
   */
  dungeonModifier: string;

  constructor() {
    this.width = 0;
    this.height = 0;
    this.name = '';
    this.displayName = '';
    this.realmName = '';
    this.difficulty = 0;
    this.fp = 0;
    this.background = 0;
    this.allowPlayerTeleport = false;
    this.showDisplays = false;
    this.maxPlayers = 0;
    this.gameOpenedTime = 0;
    this.newBool = false;
    this.buildVersion = '';
    this.newInt = 0 
    this.dungeonModifier = '';
  }

  read(reader: Reader): void {
    this.width = reader.readInt32();
    this.height = reader.readInt32();
    this.name = reader.readString();
    this.displayName = reader.readString();
    this.realmName = reader.readString();
    this.fp = reader.readUInt32();
    this.background = reader.readInt32();
    this.difficulty = reader.readFloat();
    this.allowPlayerTeleport = reader.readBoolean();
    this.showDisplays = reader.readBoolean();
    this.newBool = reader.readBoolean();
    this.maxPlayers = reader.readShort();
    this.gameOpenedTime = reader.readUInt32();
    this.buildVersion = reader.readString();
    this.newInt = reader.readInt32();
    this.dungeonModifier = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.width);
    writer.writeInt32(this.height);
    writer.writeString(this.name);
    writer.writeString(this.displayName);
    writer.writeString(this.realmName);
    writer.writeUInt32(this.fp);
    writer.writeInt32(this.background);
    writer.writeFloat(this.difficulty);
    writer.writeBoolean(this.allowPlayerTeleport);
    writer.writeBoolean(this.showDisplays);
    writer.writeBoolean(this.newBool);
    writer.writeShort(this.maxPlayers);
    writer.writeUInt32(this.gameOpenedTime);
    writer.writeString(this.buildVersion);
    writer.writeInt32(this.newInt);
    writer.writeString(this.dungeonModifier)
  }

  toString(): string {
    return `[MapInfo] Width: ${this.width}\n
    Height: ${this.height}\n
    Name: ${this.name}\n
    DisplayName: ${this.displayName}\n
    RealmName: ${this.realmName}\n
    FP: ${this.fp}\n
    Background: ${this.background}\n
    Difficulty: ${this.difficulty}\n
    AllowTeleport: ${this.allowPlayerTeleport}\n
    ShowDisplays: ${this.showDisplays}\n
    MaxPlayers: ${this.maxPlayers}\n
    GameOpenedTime: ${this.gameOpenedTime}`
  }
}
