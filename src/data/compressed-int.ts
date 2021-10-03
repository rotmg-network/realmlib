import { Reader } from '../reader';
import { Writer } from '../writer';

/**
 * A class for dealing with DECA's new style of integer compression
 */
export class CompressedInt {
  /**
   * Pass a reader and read the compressed in
   * @param reader
   * @deprecated This will be moved to Reader.ReadCompressedInt soon, there may be code brakeage with no updates
   */
  read(reader: Reader): number {
    let uByte = reader.readUnsignedByte();
    const isNegative = (uByte & 64) !== 0;
    let shift = 6;
    let value = uByte & 63;

    while (uByte & 128) {
      uByte = reader.readUnsignedByte();
      value = value | (uByte & 127) << shift;
      shift += 7;
    }

    if (isNegative) {
      value = -value;
    }
    return value;
  }

  /**
   * Pass a writer and write the compressed as a number
   * @param writer
   * @param amount The value you wish to compress
   * @deprecated This will be moved to Reader.ReadCompressedInt soon, there may be code brakeage with no updates
   */
  write(writer: Writer, amount: number): void {
    const isNegative = amount < 0;
    let value = isNegative ? -amount : amount;
    let byte = value & 63;
    if (isNegative) {
      byte |= 64;
    }
    value >>= 6;

    const isPositive = amount > 0;
    if (isPositive) {
      byte |= 128;
    }

    writer.writeUnsignedByte(byte);
    while (isPositive) {
      byte = value & 127;
      value >>= 7;
      if (isPositive) {
        byte |= 128;
      }
      writer.writeUnsignedByte(byte);
    }
  }
}
