/// <reference types="node" />
/**
 * A wrapper class which provides methods
 * for writing data to a buffer.
 */
export declare class Writer {
    /**
     * The current index of the buffer.
     */
    index: number;
    /**
     * The wrapped buffer.
     */
    buffer: Buffer;
    private size;
    /**
     * Creates a new `Writer` and initialises the
     * wrapped buffer to the default size of 8.
     */
    constructor();
    /**
     * Writes a packet header to the first 5 bytes of this writer's buffer.
     * @param id The id to write to the header.
     */
    writeHeader(id: number): void;
    /**
     * Writes a 4 byte integer to the buffer.
     * @param value The value to write.
     */
    writeInt32(value: number): void;
    /**
     * Writes a 4 byte unsigned integer to the buffer.
     * @param value The value to write.
     */
    writeUInt32(value: number): void;
    /**
     * Writes a 2 byte integer to the buffer.
     * @param value The value to write.
     */
    writeShort(value: number): void;
    /**
     * Writes a 2 byte unsigned integer to the buffer.
     * @param value The value to write.
     */
    writeUnsignedShort(value: number): void;
    /**
     * Writes a 1 byte integer to the buffer.
     * @param value The value to write.
     */
    writeByte(value: number): void;
    /**
     * Writes a 1 byte unsigned integer to the buffer.
     * @param value The value to write.
     */
    writeUnsignedByte(value: number): void;
    /**
     * Writes a single byte to the buffer. Writes `1` if the value is `true` and `0` otherwise.
     * @param value The value to write.
     */
    writeBoolean(value: boolean): void;
    /**
     * Writes a 4 byte floating point value to the buffer.
     * @param value The value to write.
     */
    writeFloat(value: number): void;
    /**
     * Writes the length of the array as a 2 byte integer, then writes `length` bytes to the buffer.
     * @param value The value to write.
     */
    writeByteArray(value: number[]): void;
    /**
     * Writes the length of the string as a 2 byte integer, then writes the string to the buffer.
     * @param value The value to write.
     */
    writeString(value: string): void;
    /**
     * The same as `writeString()`, but writes 4 bytes for the length.
     * @param value The value to write.
     */
    writeStringUTF32(value: string): void;
    /**
     * Ensures there is enough capacity in the current buffer to store `addedBytes` more bytes.
     * @param addedBytes The number of bytes which need to be added.
     */
    private checkCapacity;
}
