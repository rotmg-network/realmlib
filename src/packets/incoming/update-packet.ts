import { GroundTileData, ObjectData, WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Adds newly visible tiles and objects and removes objects that left view.
 */
export class UpdatePacket implements Packet {

  readonly type = PacketType.UPDATE;

  //#region packet-specific members
  /** View origin used for the update. */
  pos: WorldPosData;
  /** Map/view-level discriminator. Its exact gameplay meaning is unresolved. */
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
  /** Whether a legacy/variant payload included an extra trailing byte. */
  hasTrailingByte: boolean;
  /** Optional legacy/variant trailing byte. Not emitted by the current client. */
  unknownByte: number;
  //#endregion

  constructor() {
    this.pos = new WorldPosData();
    this.levelType = 0;
    this.tiles = [];
    this.newObjects = [];
    this.drops = [];
    this.hasTrailingByte = false;
    this.unknownByte = 0;
  }

  read(reader: Reader): void {
    this.pos.read(reader);
    this.levelType = reader.readByte();

    const tilesLen = reader.validateCollectionCount(reader.readCompressedInt(), 6, 'ground tiles');
    this.tiles = new Array<GroundTileData>(tilesLen);
    for (let i = 0; i < this.tiles.length; i++) {
      const gd = new GroundTileData();
      gd.read(reader);
      this.tiles[i] = gd;
    }

    const newObjectsLen = reader.validateCollectionCount(reader.readCompressedInt(), 12, 'new objects');
    this.newObjects = new Array<ObjectData>(newObjectsLen);
    for (let i = 0; i < newObjectsLen; i++) {
      const od = new ObjectData();
      od.read(reader);
      this.newObjects[i] = od;
    }

    const dropsLen = reader.validateCollectionCount(reader.readCompressedInt(), 1, 'object drops');
    this.drops = new Array<number>(dropsLen);
    for (let i = 0; i < dropsLen; i++) {
      this.drops[i] = reader.readCompressedInt();
    }

    this.hasTrailingByte = reader.remaining > 0;
    if (this.hasTrailingByte) {
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
    if (this.hasTrailingByte) {
      writer.writeUnsignedByte(this.unknownByte);
    }
  }
}
