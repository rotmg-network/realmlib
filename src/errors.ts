/**
 * Error codes used by realmlib. Consumers can branch on `error.code` to tell
 * recoverable protocol errors (a single corrupt frame) apart from fatal ones.
 */
export type RealmlibErrorCode =
  | 'PACKET_READ_ERROR'
  | 'INVALID_FRAME_LENGTH'
  | 'FRAME_TOO_LARGE'
  | 'UNKNOWN_PACKET_TYPE'
  | 'MISSING_PACKET_FACTORY'
  | 'MISSING_MAPPING'
  | 'INVALID_PACKET_ID'
  | 'INVALID_RAW_ID'
  | 'OUTGOING_QUEUE_FULL'
  | 'PACKET_WRITE_ERROR';

/** Base class for realmlib errors, carrying a machine-readable `code`. */
export class RealmlibError extends Error {
  constructor(
    readonly code: RealmlibErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
    // Restore the prototype chain when compiled to ES5 targets.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a `read` would go past the end of the current packet — e.g. a
 * corrupt or truncated frame, or a wire-supplied length that exceeds the
 * remaining bytes. This is recoverable: the framing layer catches it and emits
 * it on the `error` event rather than reading stale buffer memory.
 */
export class PacketReadError extends RealmlibError {
  constructor(message: string) {
    super('PACKET_READ_ERROR', message);
  }
}

/** Raised when a frame prefix is shorter than the mandatory five-byte header. */
export class InvalidFrameLengthError extends RealmlibError {
  constructor(readonly frameLength: number) {
    super('INVALID_FRAME_LENGTH', `Frame length must be at least 5 bytes, got ${frameLength}`);
  }
}

/** Raised when a frame prefix exceeds the configured safety limit. */
export class FrameTooLargeError extends RealmlibError {
  constructor(
    readonly frameLength: number,
    readonly maximumFrameSize: number,
  ) {
    super('FRAME_TOO_LARGE', `Frame length ${frameLength} exceeds maximum ${maximumFrameSize}`);
  }
}

/** Raised when a packet type or incoming id is not part of the registry/map. */
export class UnknownPacketTypeError extends RealmlibError {
  constructor(value: string | number) {
    super('UNKNOWN_PACKET_TYPE', `Unknown packet type or id: ${String(value)}`);
  }
}

/** Raised when a known packet type deliberately has no modeled factory. */
export class MissingPacketFactoryError extends RealmlibError {
  constructor(readonly packetType: string) {
    super('MISSING_PACKET_FACTORY', `Packet type ${packetType} has no implemented factory`);
  }
}

/** Raised when a packet type has no usable numeric wire mapping. */
export class PacketMappingError extends RealmlibError {
  constructor(code: 'MISSING_MAPPING' | 'INVALID_PACKET_ID' | 'INVALID_RAW_ID', message: string) {
    super(code, message);
  }
}

/** Raised when serialization or the underlying socket write fails. */
export class PacketWriteError extends RealmlibError {
  constructor(message: string) {
    super('PACKET_WRITE_ERROR', message);
  }
}
