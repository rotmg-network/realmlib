import { GroundTileData, ObjectData, CompressedInt } from '../../data';
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
  //#endregion

  constructor() {
    this.tiles = [];
    this.newObjects = [];
    this.drops = [];
  }

  read(reader: Reader): void {
    this.tiles = new Array<GroundTileData>(new CompressedInt().read(reader));
    for (let i = 0; i < this.tiles.length; i++) {
      const gd = new GroundTileData();
      gd.read(reader);
      this.tiles[i] = gd;
    }

    const newObjectsLen = new CompressedInt().read(reader);
    this.newObjects = new Array<ObjectData>(newObjectsLen);
    for (let i = 0; i < newObjectsLen; i++) {
      const od = new ObjectData();
      od.read(reader);
      this.newObjects[i] = od;
    }

    const dropsLen = new CompressedInt().read(reader);
    this.drops = new Array<number>(dropsLen);
    for (let i = 0; i < dropsLen; i++) {
      this.drops[i] = new CompressedInt().read(reader);
    }
  }

  write(writer: Writer): void {
    new CompressedInt().write(writer, this.tiles.length);
    for (const tile of this.tiles) {
      tile.write(writer);
    }
    new CompressedInt().write(writer, this.tiles.length);
    for (const obj of this.newObjects) {
      obj.write(writer);
    }
    new CompressedInt().write(writer, this.tiles.length);
    for (const drop of this.drops) {
      new CompressedInt().write(writer, drop);
    }
  }
}
