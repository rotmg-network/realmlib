/// <reference types="node" />
/**
 * A wrapper to add more options to read data from the raw bytes of a buffer
 */
export declare class Reader {
    /**
     * The default size when this reader is reset
     */
    static readonly DEFAULT_SIZE: number;
    /**
     * The current position of the pointer in the buffer
     */
    index: number;
    buffer: Buffer;
    get length(): number;
    get remaining(): number;
    private _length;
    /**
     * Creates a new `Reader` and initialises the
     * wrapped buffer to the given `size`.
     * @param size The size of the buffer.
     */
    constructor(size?: number);
    /**
     * Reads a 4 byte integer from the buffer.
     */
    readInt32(): number;
    /**
     * Reads a 4 byte unsigned integer from the buffer
     */
    readUInt32(): number;
    /**
     * Reads a 2 byte integer from the buffer
     */
    readShort(): number;
    /**
     * Reads a 2 byte unsigned integer from the buffer
     */
    readUnsignedShort(): number;
    /**
     * Reads a 1 byte integer from the buffer
     */
    readByte(): number;
    /**
     * Reads a 1 byte unsigned integer from the buffer
     */
    readUnsignedByte(): number;
    /**
     * Reads a single byte from the buffer, returns `true` if the byte is `1` and `false` otherwise
     */
    readBoolean(): boolean;
    /**
     * Reads a 4 byte floating point number from the buffer
     */
    readFloat(): number;
    /**
     * Reads 2 bytes to get the length, then reads `length` bytes from the buffer
     */
    readByteArray(): number[];
    /**
     * Reads `size` bytes from the buffer
     * @param size The number of bytes to read
     */
    readBytes(size: number): number[];
    /**
     * Reads 2 bytes to get the length, reads `length` bytes from the buffer, then converts
     * the result to a utf8 string
     */
    readString(): string;
    /**
     * The same as `readString()`, but reads 4 bytes for the length
     */
    readStringUTF32(): string;
    /**
     * Changes the size of the buffer without affecting the contents
     * @param newSize The new size of the buffer
     */
    resizeBuffer(newSize: number): void;
    /**
     * Resets the `bufferIndex` to `0` and allocates a fresh buffer of length `DEFAULT_SIZE` to the underlying buffer
     */
    reset(): void;
}
