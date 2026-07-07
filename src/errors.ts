/**
 * Error codes used by realmlib. Consumers can branch on `error.code` to tell
 * recoverable protocol errors (a single corrupt frame) apart from fatal ones.
 */
export type RealmlibErrorCode =
  | 'PACKET_READ_ERROR'
  | 'FRAME_TOO_LARGE'
  | 'MISSING_MAPPING'
  | 'INVALID_RAW_ID';

/** Base class for realmlib errors, carrying a machine-readable `code`. */
export class RealmlibError extends Error {
  constructor(readonly code: RealmlibErrorCode, message: string) {
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
