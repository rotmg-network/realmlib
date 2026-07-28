'use strict';

const { performance } = require('node:perf_hooks');

const iterations = Number.parseInt(process.env.REALMLIB_BENCH_ITERATIONS || '1000000', 10);
if (!Number.isInteger(iterations) || iterations < 1) {
  throw new RangeError('REALMLIB_BENCH_ITERATIONS must be a positive integer');
}

const frame = Buffer.alloc(37);
frame.writeInt32BE(frame.length, 0);
frame.writeUInt8(1, 4);
const body = frame.subarray(5);

function measure(label, operation) {
  let checksum = 0;
  const started = performance.now();
  for (let index = 0; index < iterations; index++) {
    checksum ^= operation()[index & 31];
  }
  return {
    label,
    milliseconds: performance.now() - started,
    checksum,
  };
}

// Alternate ordering across two passes to reduce warm-up and ordering bias.
for (const operations of [
  [
    ['legacy eager Buffer.from()', () => Buffer.from(body)],
    ['deferred body view', () => body],
  ],
  [
    ['deferred body view', () => body],
    ['legacy eager Buffer.from()', () => Buffer.from(body)],
  ],
]) {
  for (const [label, operation] of operations) {
    const result = measure(label, operation);
    console.log(
      `${result.label}: ${result.milliseconds.toFixed(2)}ms `
      + `(${iterations.toLocaleString()} ignored frames, checksum ${result.checksum})`,
    );
  }
}
