import { GroundTileData, ObjectData, WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when an update even occurs. Some events include
 * + One or more new objects have entered the map (become visible)
 * + One or more objects have left the map (become invisible)
 * + New tiles are visible
 */
export class UpdatePacket implements Packet {

  readonly type = PacketType.UPDATE;

  //#region packet-specific members
  /**
   * this is the position of the player???
   */
  pos: WorldPosData;
  /**
   * Lever type, No fucking idea
   */
  levelType: number;
  /**
   * The new tiles which are visible.
   */
  tiles: GroundTileData[];
  /**
   * The new objects which have entered the map (become visible).
   */
  newObjects: ObjectData[];
  /**
   * The visible objects which have left the map (become invisible).
   */
  drops: number[];
  /**
   * Trailing byte present in recent builds. Purpose unknown; defaults to 0.
   */
  unknownByte: number;
  //#endregion

  constructor() {
    this.pos = new WorldPosData();
    this.levelType = 0;
    this.tiles = [];
    this.newObjects = [];
    this.drops = [];
    this.unknownByte = 0;
  }

  read(reader: Reader): void {
    this.pos.read(reader);
    this.levelType = reader.readByte();

    const tilesLen = reader.readCompressedInt()
    this.tiles = new Array<GroundTileData>(tilesLen);
    for (let i = 0; i < this.tiles.length; i++) {
      const gd = new GroundTileData();
      gd.read(reader);
      this.tiles[i] = gd;
    }

    const newObjectsLen = reader.readCompressedInt();
    this.newObjects = new Array<ObjectData>(newObjectsLen);
    for (let i = 0; i < newObjectsLen; i++) {
      const od = new ObjectData();
      od.read(reader);
      this.newObjects[i] = od;
    }

    const dropsLen = reader.readCompressedInt();
    this.drops = new Array<number>(dropsLen);
    for (let i = 0; i < dropsLen; i++) {
      this.drops[i] = reader.readCompressedInt();
    }

    if (reader.remaining > 0) {
      this.unknownByte = reader.readUnsignedByte();
    }
  }

  write(writer: Writer): void {
    this.pos.write(writer);
    writer.writeByte(this.levelType);
    writer.writeCompressedInt(this.tiles.length);
    for (const tile of this.tiles) {
      tile.write(writer);
    }
    writer.writeCompressedInt(this.newObjects.length);
    for (const obj of this.newObjects) {
      obj.write(writer);
    }
    writer.writeCompressedInt(this.drops.length);
    for (const drop of this.drops) {
      writer.writeCompressedInt(drop);
    }
    writer.writeUnsignedByte(this.unknownByte);
  }
}
