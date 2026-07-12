import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * A packet which contains a bitmap image
 */
export class PicPacket implements Packet {

  readonly type = PacketType.PIC;

  /**
   * The width of the image.
   */
  width: number;
  /**
   * The height of the image.
   */
  height: number;
  /**
   * The bitmap data of the image.
   */
  bitmapData: number[];

  constructor() {
    this.width = 0;
    this.height = 0;
    this.bitmapData = [];
  }

  read(reader: Reader): void {
    this.width = reader.readInt32();
    this.height = reader.readInt32();
    // The bitmap is a raw RGBA byte run whose length is derived from the
    // dimensions — there is NO length prefix on the wire.
    this.bitmapData = reader.readBytes(this.width * this.height * 4);
  }

  write(writer: Writer): void {
    writer.writeInt32(this.width);
    writer.writeInt32(this.height);
    // Must mirror read(): write the raw bytes with no length prefix.
    // (writeByteArray() would prepend a 2-byte length that read() never
    // consumes, corrupting the frame on round-trip.)
    for (const byte of this.bitmapData) {
      writer.writeUnsignedByte(byte);
    }
  }

  toString(): string {
    return `[Pic] Width: ${this.width} - Height: ${this.height}\n
    Bytes: ${this.bitmapData.toString()}`;
  }
}
