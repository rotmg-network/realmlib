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
