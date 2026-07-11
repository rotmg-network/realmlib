import { PacketReadError } from './errors';

/**
 * A wrapper to add more options to read data from the raw bytes of a buffer
 */
export class Reader {
  /**
   * The default size when this reader is reset
   */
  static readonly DEFAULT_SIZE: number = 4;

  /** The current position of the pointer in the buffer */
  index: number;

  buffer: Buffer;

  get length(): number {
    return this._length;
  }


  get remaining(): number {
    return this._length - this.index;
  }

  private _length: number;

  /**
   * Throws a {@link PacketReadError} if reading `bytes` more would run past the
   * end of the current packet. Guards every read so a corrupt/truncated frame
   * fails loudly instead of silently reading stale bytes from a prior packet.
   */
  private ensure(bytes: number): void {
    if (bytes < 0 || this.index + bytes > this._length) {
      throw new PacketReadError(
        `read of ${bytes} byte(s) at offset ${this.index} exceeds packet length ${this._length}`,
      );
    }
  }

  /** Creates a new `Reader` and initialises the
   * wrapped buffer to the given `size`.
   * @param size The size of the buffer.
   */
  constructor(size: number = Reader.DEFAULT_SIZE) {
    this.index = 0;
    this.buffer = Buffer.alloc(size);
    this._length = size;
  }

  /** Reads a 4 byte integer from the buffer. */
  readInt32(): number {
    this.ensure(4);
    const result = this.buffer.readInt32BE(this.index);
    this.index += 4;
    return result;
  }

  /** Reads a 4 byte unsigned integer from the buffer */
  readUInt32(): number {
    this.ensure(4);
    const result = this.buffer.readUInt32BE(this.index);
    this.index += 4;
    return result;
  }

  /** Reads a 2 byte integer from the buffer */
  readShort(): number {
    this.ensure(2);
    const result = this.buffer.readInt16BE(this.index);
    this.index += 2;
    return result;
  }

  /** Reads a 2 byte unsigned integer from the buffer */
  readUnsignedShort(): number {
    this.ensure(2);
    const result = this.buffer.readUInt16BE(this.index);
    this.index += 2;
    return result;
  }

  /** Reads a 1 byte integer from the buffer */
  readByte(): number {
    this.ensure(1);
    const result = this.buffer.readInt8(this.index);
    this.index++;
    return result;
  }

  /** Reads a 1 byte unsigned integer from the buffer */
  readUnsignedByte(): number {
    this.ensure(1);
    const result = this.buffer.readUInt8(this.index);
    this.index++;
    return result;
  }

  /** Reads a single byte from the buffer, returns `true` if the byte is `1` and `false` otherwise */
  readBoolean(): boolean {
    const result = this.readByte();
    return result !== 0;
  }

  /** Reads a 4 byte floating point number from the buffer */
  readFloat(): number {
    this.ensure(4);
    const result = this.buffer.readFloatBE(this.index);
    this.index += 4;
    return result;
  }

  /** Reads 2 bytes to get the length, then reads `length` bytes from the buffer */
  readByteArray(): number[] {
    const arraylen = this.readUnsignedShort();
    this.ensure(arraylen);
    const result = new Array<number>(arraylen);
    for (let i = 0; i < arraylen; i++ , this.index++) {
      result[i] = this.buffer[this.index];
    }
    return result;
  }

  /** Reads `size` bytes from the buffer
   * @param size The number of bytes to read
   */
  readBytes(size: number): number[] {
    this.ensure(size);
    const result = new Array<number>(size);
    for (let i = 0; i < size; i++ , this.index++) {
      result[i] = this.buffer[this.index];
    }
    return result;
  }

  /** Reads 2 bytes to get the length, reads `length` bytes from the buffer, then converts
   * the result to a utf8 string
   */
  readString(): string {
    const strlen = this.readUnsignedShort();
    this.ensure(strlen);
    this.index += strlen;
    return this.buffer.subarray(this.index - strlen, this.index).toString('utf8');
  }

  /** The same as `readString()`, but reads 4 bytes for the length */
  readStringUTF32(): string {
    const strlen = this.readInt32();
    this.ensure(strlen);
    this.index += strlen;
    return this.buffer.subarray(this.index - strlen, this.index).toString('utf8');
  }

  /**
   * Reads DECA's variable-length signed integer ("compressed int"). The first
   * byte carries the sign in bit 6 (`0x40`) and the low 6 magnitude bits; bit 7
   * (`0x80`) is the "more bytes follow" flag. Each subsequent byte adds 7
   * magnitude bits (little-endian) and its own continuation flag. Mirrors
   * {@link Writer.writeCompressedInt}. Values are int32-range.
   */
  readCompressedInt(): number {
    let uByte = this.readUnsignedByte();
    const isNegative = (uByte & 64) !== 0;
    let shift = 6;
    let value = uByte & 63;

    while (uByte & 128) {
      uByte = this.readUnsignedByte();
      value = value | (uByte & 127) << shift;
      shift += 7;
    }

    if (isNegative) {
      value = -value;
    }
    return value;
  }

  /** Changes the size of the buffer without affecting the contents
   * @param newSize The new size of the buffer
   */
  resizeBuffer(newSize: number): void {
    this._length = newSize;
    if (this.buffer.length < newSize) {
      this.buffer = Buffer.concat([this.buffer, Buffer.alloc(newSize - this.buffer.length)], newSize);
    }
  }

  /** Resets the `bufferIndex` to `0` and allocates a fresh buffer of length `DEFAULT_SIZE` to the underlying buffer */
  reset(): void {
    this.index = 0;
    this.buffer = Buffer.alloc(Reader.DEFAULT_SIZE);
    this._length = Reader.DEFAULT_SIZE;
  }
}
