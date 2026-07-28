import { DataPacket } from '../packet';
import { Reader } from '../reader';
import { Writer } from '../writer';

/** Unity-style RGBA color serialized as four float32 values. */
export class ColorData implements DataPacket {
  red: number;
  green: number;
  blue: number;
  alpha: number;

  constructor(red = 0, green = 0, blue = 0, alpha = 0) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  read(reader: Reader): void {
    this.red = reader.readFloat();
    this.green = reader.readFloat();
    this.blue = reader.readFloat();
    this.alpha = reader.readFloat();
  }

  write(writer: Writer): void {
    writer.writeFloat(this.red);
    writer.writeFloat(this.green);
    writer.writeFloat(this.blue);
    writer.writeFloat(this.alpha);
  }
}
