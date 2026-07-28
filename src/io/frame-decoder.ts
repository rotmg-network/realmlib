import { FrameTooLargeError, InvalidFrameLengthError } from '../errors';

/**
 * Incrementally separates a TCP byte stream into complete RotMG frames.
 * Encryption is deliberately left to the caller because the four-byte length
 * and one-byte packet id are plaintext.
 */
export class FrameDecoder {
  private buffer = Buffer.alloc(4);
  private offset = 0;

  constructor(readonly maximumFrameSize: number) {
    if (!Number.isInteger(maximumFrameSize) || maximumFrameSize < 5) {
      throw new RangeError('maximumFrameSize must be an integer of at least 5');
    }
  }

  push(data: Buffer): Buffer[] {
    const frames: Buffer[] = [];
    let dataOffset = 0;
    while (dataOffset < data.length) {
      const copied = data.copy(this.buffer, this.offset, dataOffset);
      this.offset += copied;
      dataOffset += copied;

      if (this.offset !== this.buffer.length) {
        continue;
      }
      if (this.buffer.length === 4) {
        const length = this.buffer.readInt32BE(0);
        if (length < 5) {
          this.reset();
          throw new InvalidFrameLengthError(length);
        }
        if (length > this.maximumFrameSize) {
          this.reset();
          throw new FrameTooLargeError(length, this.maximumFrameSize);
        }
        const header = this.buffer;
        this.buffer = Buffer.alloc(length);
        header.copy(this.buffer);
        this.offset = 4;
        continue;
      }

      frames.push(this.buffer);
      this.buffer = Buffer.alloc(4);
      this.offset = 0;
    }
    return frames;
  }

  reset(): void {
    this.buffer = Buffer.alloc(4);
    this.offset = 0;
  }
}
