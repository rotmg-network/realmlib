import { ColorData, WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Server debug overlay instruction for a world-space arrow. */
export class DrawDebugArrowPacket implements Packet {
  readonly type = PacketType.DRAW_DEBUG_ARROW;

  color: ColorData;
  startPosition: WorldPosData;
  endPosition: WorldPosData;
  time: number;
  scale: number;

  constructor() {
    this.color = new ColorData();
    this.startPosition = new WorldPosData();
    this.endPosition = new WorldPosData();
    this.time = 0;
    this.scale = 0;
  }

  read(reader: Reader): void {
    this.color.read(reader);
    this.startPosition.read(reader);
    this.endPosition.read(reader);
    this.time = reader.readFloat();
    this.scale = reader.readFloat();
  }

  write(writer: Writer): void {
    this.color.write(writer);
    this.startPosition.write(writer);
    this.endPosition.write(writer);
    writer.writeFloat(this.time);
    writer.writeFloat(this.scale);
  }
}
