/**
 * Formats a buffer as an offset / hex / ascii dump, the way a hex editor
 * would. Useful for eyeballing the raw bytes of a packet when reverse
 * engineering or debugging a structure.
 *
 * @param data The bytes to dump.
 * @param bytesPerRow How many bytes to show per row. Defaults to 16.
 */
export function hexdump(data: Buffer | number[], bytesPerRow: number = 16): string {
  const buffer = Array.isArray(data) ? Buffer.from(data) : data;
  const lines: string[] = [];
  for (let offset = 0; offset < buffer.length; offset += bytesPerRow) {
    const row = buffer.subarray(offset, offset + bytesPerRow);
    const hex = Array.from(row, (b) => b.toString(16).padStart(2, '0')).join(' ');
    const ascii = Array.from(row, (b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.')).join('');
    lines.push(`${offset.toString(16).padStart(4, '0')}  ${hex.padEnd(bytesPerRow * 3 - 1)}  ${ascii}`);
  }
  return lines.join('\n');
}

export interface PacketFieldProbe {
  /** Candidate primitive interpretation. */
  kind: 'uint8' | 'int8' | 'uint16' | 'int16' | 'int32' | 'uint32' | 'float32' | 'string' | 'compressedInt';
  /** Number of bytes consumed by this interpretation. */
  bytes: number;
  value: number | string;
}

/**
 * Produces non-destructive primitive interpretations at one payload offset.
 * Useful when an unknown packet or a known parser stops at an unseen field.
 */
export function probePacketFields(payload: Buffer, offset: number = 0): PacketFieldProbe[] {
  if (!Number.isInteger(offset) || offset < 0 || offset > payload.length) {
    throw new RangeError(`offset must be within the payload, got ${offset}`);
  }
  const data = payload.subarray(offset);
  const probes: PacketFieldProbe[] = [];
  if (data.length >= 1) {
    probes.push({ kind: 'uint8', bytes: 1, value: data.readUInt8(0) });
    probes.push({ kind: 'int8', bytes: 1, value: data.readInt8(0) });

    let byte = data.readUInt8(0);
    const negative = (byte & 0x40) !== 0;
    let value = byte & 0x3f;
    let shift = 6;
    let bytes = 1;
    while ((byte & 0x80) !== 0 && bytes < data.length && bytes < 5) {
      byte = data.readUInt8(bytes++);
      value += (byte & 0x7f) * 2 ** shift;
      shift += 7;
    }
    if ((byte & 0x80) === 0) {
      probes.push({ kind: 'compressedInt', bytes, value: negative ? -value : value });
    }
  }
  if (data.length >= 2) {
    probes.push({ kind: 'uint16', bytes: 2, value: data.readUInt16BE(0) });
    probes.push({ kind: 'int16', bytes: 2, value: data.readInt16BE(0) });
    const length = data.readUInt16BE(0);
    if (length <= data.length - 2) {
      const value = data.subarray(2, 2 + length).toString('utf8');
      probes.push({ kind: 'string', bytes: length + 2, value });
    }
  }
  if (data.length >= 4) {
    probes.push({ kind: 'int32', bytes: 4, value: data.readInt32BE(0) });
    probes.push({ kind: 'uint32', bytes: 4, value: data.readUInt32BE(0) });
    probes.push({ kind: 'float32', bytes: 4, value: data.readFloatBE(0) });
  }
  return probes;
}
