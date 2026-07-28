import { ColorData, WorldPosData } from '../../data';
import { DebugShape } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Server debug overlay instruction for a world-space square or circle. */
export class DrawDebugShapePacket implements Packet {
  readonly type = PacketType.DRAW_DEBUG_SHAPE;

  color: ColorData;
  position: WorldPosData;
  shape: DebugShape;
  time: number;
  scale: number;

  constructor() {
    this.color = new ColorData();
    this.position = new WorldPosData();
    this.shape = DebugShape.Square;
    this.time = 0;
    this.scale = 0;
  }

  read(reader: Reader): void {
    this.color.read(reader);
    this.position.read(reader);
    this.shape = reader.readUnsignedByte() as DebugShape;
    this.time = reader.readFloat();
    this.scale = reader.readFloat();
  }

  write(writer: Writer): void {
    this.color.write(writer);
    this.position.write(writer);
    writer.writeUnsignedByte(this.shape);
    writer.writeFloat(this.time);
    writer.writeFloat(this.scale);
  }
}
