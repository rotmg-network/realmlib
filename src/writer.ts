/**
 * A wrapper class which provides methods
 * for writing data to a buffer.
 */
export class Writer {
  /** The current index of the buffer */
  index: number;
  /** The wrapped buffer */
  buffer: Buffer;

  private size: number;

  /** Creates a new `Writer` and initialises the
   * wrapped buffer to the default size of 8. */
  constructor() {
    this.size = 8;
    this.index = 0;
    this.buffer = Buffer.alloc(this.size);
  }

  /**
   * Writes the 5-byte packet header into the first 5 bytes of the buffer:
   * a 4-byte big-endian total length (the current `index`, which the caller
   * must have advanced past the body) followed by the 1-byte packet id.
   *
   * Call this AFTER writing the body, and only when the body was written
   * starting at index 5 (i.e. the first 5 bytes were reserved for the
   * header) — otherwise this overwrites body bytes. See `PacketIO.drainQueue`.
   * @param id The packet id to write to the header.
   */
  writeHeader(id: number): void {
    this.assertInteger(id, 0, 0xff, 'packet id');
    this.assertInteger(this.index, 5, 0x7fffffff, 'packet length');
    this.buffer.writeInt32BE(this.index, 0);
    this.buffer.writeUInt8(id, 4);
  }

  /** Writes a 4 byte integer to the buffer.
   * @param value The value to write.
   */
  writeInt32(value: number): void {
    this.assertInteger(value, -0x80000000, 0x7fffffff, 'int32');
    this.checkCapacity(4);
    this.index = this.buffer.writeInt32BE(value, this.index);
  }

  /** Writes a 4 byte unsigned integer to the buffer.
   * @param value The value to write.
   */
  writeUInt32(value: number): void {
    this.assertInteger(value, 0, 0xffffffff, 'uint32');
    this.checkCapacity(4);
    this.index = this.buffer.writeUInt32BE(value, this.index);
  }

  /** Writes a 2 byte integer to the buffer.
   * @param value The value to write.
   */
  writeShort(value: number): void {
    this.assertInteger(value, -0x8000, 0x7fff, 'int16');
    this.checkCapacity(2);
    this.index = this.buffer.writeInt16BE(value, this.index);
  }

  /** Writes a 2 byte unsigned integer to the buffer.
   * @param value The value to write.
   */
  writeUnsignedShort(value: number): void {
    this.assertInteger(value, 0, 0xffff, 'uint16');
    this.checkCapacity(2);
    this.index = this.buffer.writeUInt16BE(value, this.index);
  }

  /** Writes a 1 byte integer to the buffer.
   * @param value The value to write.
   */
  writeByte(value: number): void {
    this.assertInteger(value, -0x80, 0x7f, 'int8');
    this.checkCapacity(1);
    this.index = this.buffer.writeInt8(value, this.index);
  }

  /**
   * Writes a 1 byte unsigned integer to the buffer.
   * @param value The value to write.
   */
  writeUnsignedByte(value: number): void {
    this.assertInteger(value, 0, 0xff, 'uint8');
    this.checkCapacity(1);
    this.index = this.buffer.writeUInt8(value, this.index);
  }

  /**
   * Writes a single byte to the buffer. Writes `1` if the value is `true` and `0` otherwise.
   * @param value The value to write.
   */
  writeBoolean(value: boolean): void {
    if (typeof value !== 'boolean') {
      throw new TypeError(`boolean must be true or false, got ${String(value)}`);
    }
    const byteValue = value ? 1 : 0;
    this.writeByte(byteValue);
  }

  /** Writes a 4 byte floating point value to the buffer.
   * @param value The value to write.
   */
  writeFloat(value: number): void {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(`float32 must be a finite number, got ${String(value)}`);
    }
    if (Math.abs(value) > 3.4028234663852886e38) {
      throw new RangeError(`float32 value out of range: ${value}`);
    }
    this.checkCapacity(4);
    this.index = this.buffer.writeFloatBE(value, this.index);
  }

  /* Writes the length of the array as a 2 byte integer, then writes `length` bytes to the buffer.
   * @param value The value to write.
   */
  writeByteArray(value: number[]): void {
    if (!Array.isArray(value)) {
      throw new TypeError('byte array must be an array');
    }
    for (const byte of value) {
      this.assertInteger(byte, 0, 0xff, 'byte array value');
    }
    this.writeUnsignedShort(value.length);
    this.checkCapacity(value.length);
    for (const byte of value) {
      this.buffer[this.index++] = byte;
    }
  }

  /** Writes the length of the string as a 2 byte integer, then writes the string to the buffer.
   * @param value The value to write.
   */
  writeString(value: string): void {
    if (typeof value !== 'string') {
      throw new TypeError(`string value must be a string, got ${typeof value}`);
    }
    const byteLength = Buffer.byteLength(value, 'utf8');
    this.assertInteger(byteLength, 0, 0xffff, 'string byte length');
    this.writeUnsignedShort(byteLength);
    this.checkCapacity(byteLength);
    this.index += this.buffer.write(value, this.index, 'utf8');
  }

  /** The same as `writeString()`, but writes 4 bytes for the length.
   * @param value The int value to write.
   */
  writeStringUTF32(value: string): void {
    if (typeof value !== 'string') {
      throw new TypeError(`string value must be a string, got ${typeof value}`);
    }
    const byteLength = Buffer.byteLength(value, 'utf8');
    this.writeInt32(byteLength);
    this.checkCapacity(byteLength);
    this.index += this.buffer.write(value, this.index, 'utf8');
  }

  /**
   * Writes a signed integer in DECA's variable-length "compressed int" form.
   * The first byte holds the sign (bit `0x40`) and 6 magnitude bits; bit
   * `0x80` flags that more bytes follow, each adding 7 magnitude bits. Inverse
   * of {@link Reader.readCompressedInt}.
   * @param amount The int value to write.
   */
  writeCompressedInt(amount: number): void {
    this.assertInteger(amount, -0x7fffffff, 0x7fffffff, 'compressed int');
    const isNegative = amount < 0;
    let value = isNegative ? -amount : amount;
    let byte = value & 63;
    value >>= 6;
    if (isNegative) {
      byte |= 64;
    }
    if (value !== 0) {
      byte |= 128;
    }
    this.writeUnsignedByte(byte);
    while (value !== 0) {
      byte = value & 127;
      value >>= 7;
      if (value !== 0) {
        byte |= 128;
      }
      this.writeUnsignedByte(byte);
    }
  }

  /** Ensures there is enough capacity in the current buffer to store `addedBytes` more bytes.
   * @param addedBytes The number of bytes which need to be added.
   */
  private checkCapacity(addedBytes: number): void {
    while (this.index + addedBytes > this.buffer.length) {
      this.buffer = Buffer.concat([this.buffer, Buffer.alloc(this.size)], this.size * 2);
      this.size *= 2;
    }
  }

  /** Validates a fixed-width integer before it reaches Node's Buffer API. */
  private assertInteger(value: number, min: number, max: number, label: string): void {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new TypeError(`${label} must be an integer, got ${String(value)}`);
    }
    if (value < min || value > max) {
      throw new RangeError(`${label} out of range [${min}, ${max}]: ${value}`);
    }
  }
}
