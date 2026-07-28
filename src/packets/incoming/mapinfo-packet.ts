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
  /** Unresolved map flag retained under the current client's recovered name. */
  newBool: boolean;
  /**
   * Build Version
   */
  buildVersion: string;
  /**
   * The tile radius visible to the player.
   */
  viewRadius: number;
  /**
   * A second radius-like int16. It is 15 in every current-build capture,
   * matching `viewRadius`, but the client stores it separately.
   */
  newInt: number;
  /**
   * Dungeon modifiers, separated by ';' (e.g.
   * `EXPERIENCED;DRAINED_4;STONEBOSS_4;HEROICDAMAGE;` in a Lost Halls boss
   * room). Empty in the nexus and most maps. Read after `unknownInt1` /
   * `unknownBool`; reading it before them (as older builds did) mis-sliced any
   * non-empty modifier.
   */
  dungeonModifier: string;
  /** Unknown int32. Usually 0; observed as 0x120717 in The Third Dimension. */
  unknownInt1: number;
  /** Unknown boolean between `newInt` and `unknownInt1`. */
  unknownBool: boolean;
  /** Unknown trailing int16. Observed as -1 in current-build captures. */
  unknownShort2: number;
  /** Whether this MAPINFO included the optional two-int realm-score tail. */
  hasRealmScores: boolean;
  /** Max realm score. Meaningful only when `hasRealmScores` is true. */
  maxRealmScore: number;
  /** Current realm score. Meaningful only when `hasRealmScores` is true. */
  curRealmScore: number;

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
    this.viewRadius = 0;
    this.newInt = 0;
    this.dungeonModifier = '';
    this.unknownInt1 = 0;
    this.unknownBool = false;
    this.unknownShort2 = 0;
    this.hasRealmScores = false;
    this.maxRealmScore = 0;
    this.curRealmScore = 0;
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
    this.viewRadius = reader.readShort();
    this.newInt = reader.readShort();
    this.unknownBool = reader.readBoolean();
    this.unknownInt1 = reader.readInt32();
    this.dungeonModifier = reader.readString();
    this.unknownShort2 = reader.readShort();
    this.hasRealmScores = false;
    this.maxRealmScore = 0;
    this.curRealmScore = 0;
    if (reader.remaining > 0) {
      this.hasRealmScores = true;
      this.maxRealmScore = reader.readInt32();
      this.curRealmScore = reader.readInt32();
    }
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
    writer.writeShort(this.viewRadius);
    writer.writeShort(this.newInt);
    writer.writeBoolean(this.unknownBool);
    writer.writeInt32(this.unknownInt1);
    writer.writeString(this.dungeonModifier);
    writer.writeShort(this.unknownShort2);
    if (this.hasRealmScores) {
      writer.writeInt32(this.maxRealmScore);
      writer.writeInt32(this.curRealmScore);
    }
  }

  /** @deprecated Use {@link MapInfoPacket.unknownInt1}; this field has always been int32. */
  get unknownShort1(): number {
    return this.unknownInt1;
  }

  set unknownShort1(value: number) {
    this.unknownInt1 = value;
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
