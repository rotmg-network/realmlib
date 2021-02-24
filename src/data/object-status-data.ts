import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
import { CompressedInt } from './compressed-int';
import { WorldPosData } from './world-pos-data';
import { StatData } from './stat-data';

export class ObjectStatusData implements DataPacket {

  /**
   * The object id of the object which this status is for
   */
  objectId: number;
  /**
   * The position of the object which this status is for
   */
  pos: WorldPosData;
  /**
   * A list of stats for the object which this status is for
   */
  stats: StatData[];

  constructor() {
    this.objectId = 0;
    this.pos = new WorldPosData();
    this.stats = [];
  }

  read(reader: Reader): void {
    this.objectId = new CompressedInt().read(reader);
    this.pos.read(reader);
    const statLen = new CompressedInt().read(reader);
    this.stats = new Array(statLen);
    for (let i = 0; i < statLen; i++) {
      const sd = new StatData();
      sd.read(reader);
      this.stats[i] = sd;
    }
  }

  write(writer: Writer): void {
    new CompressedInt().write(writer, this.objectId);
    this.pos.write(writer);
    new CompressedInt().write(writer, this.stats.length);
    writer.writeShort(this.stats.length);
    for (const stat of this.stats) {
      stat.write(writer);
    }
  }

  toString(showStats: boolean = false): string {
    let str = `[ObjectStatusData] ObjectId: ${this.objectId} - Position: x${this.pos.x}, y${this.pos.y} - Stat amount: ${this.stats.length}`;
    if (!showStats) {
      return str;
    } else {
      for(let i = 0; i < this.stats.length; i++) {
        if (i == 0) {
          str += `\n${this.stats[i].toString()}\n`;
        } else if (i == this.stats.length - 1) {
          str += this.stats[i].toString();
        } else {
          str += `${this.stats[i].toString()}\n`;
        }
      }
      return str;
    }
  }
}
