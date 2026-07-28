#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node scripts/reconcile-exalt.cjs [--strict] [--require-complete] <packets.json>');
}

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const requireComplete = args.includes('--require-complete');
const inputArg = args.find((arg) => !arg.startsWith('--'));
if (!inputArg) {
  usage();
  process.exitCode = 2;
  return;
}

const inputPath = path.resolve(process.cwd(), inputArg);
if (!fs.existsSync(inputPath)) {
  console.error(`Exalt packet catalog not found: ${inputPath}`);
  process.exitCode = 2;
  return;
}

const catalog = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const { PACKET_REGISTRY } = require('../lib/packet-registry');
const wireKey = (id, direction) => `${direction ?? 'unknown'}:${id}`;
const localByWire = new Map();
const localByType = new Map();
for (const definition of PACKET_REGISTRY) {
  localByType.set(definition.type, definition);
  if (definition.id !== undefined && definition.id <= 255) {
    localByWire.set(wireKey(definition.id, definition.direction), definition);
  }
}

const mappings = Array.isArray(catalog.packet_mappings) ? catalog.packet_mappings : [];
const conflicts = [];
const missingLocal = [];
const directionConflicts = [];
for (const mapping of mappings) {
  const byId = localByWire.get(wireKey(mapping.id, mapping.direction))
    ?? localByWire.get(wireKey(mapping.id, 'unknown'));
  const byType = localByType.get(mapping.type);
  if (byId && byId.type !== mapping.type) {
    conflicts.push(
      `${mapping.direction} id ${mapping.id}: extractor=${mapping.type}, realmlib=${byId.type}`,
    );
  }
  if (byType && byType.id !== mapping.id) {
    conflicts.push(`type ${mapping.type}: extractor=${mapping.id}, realmlib=${byType.id}`);
  }
  if (!byId && !byType) {
    missingLocal.push(`${mapping.id}:${mapping.type}`);
  }
  if (
    byType &&
    byType.direction !== 'unknown' &&
    mapping.direction &&
    byType.direction !== mapping.direction
  ) {
    directionConflicts.push(
      `${mapping.id}:${mapping.type}: extractor=${mapping.direction}, realmlib=${byType.direction}`,
    );
  }
}

const extractedWireMappings = new Set(
  mappings.map((mapping) => wireKey(mapping.id, mapping.direction)),
);
const staleLocal = [...localByWire.values()]
  .filter((definition) => !extractedWireMappings.has(wireKey(definition.id, definition.direction)))
  .map((definition) => `${definition.id}:${definition.type}`);
const missingFactories = [...localByWire.values()]
  .filter((definition) => !definition.factory)
  .map((definition) => `${definition.id}:${definition.type}`);
const unmappedIncoming = catalog.unmapped_incoming ?? [];
const unmappedOutgoing = catalog.unmapped_outgoing ?? [];

console.log(`Exalt reconciliation: ${path.basename(inputPath)}`);
console.log(`  extractor mappings: ${mappings.length}`);
console.log(`  realmlib wire mappings: ${localByWire.size}`);
console.log(`  id/type conflicts: ${conflicts.length}`);
console.log(`  direction conflicts: ${directionConflicts.length}`);
console.log(`  extractor mappings missing locally: ${missingLocal.length}`);
console.log(`  local mappings absent from extractor: ${staleLocal.length}`);
console.log(`  mapped packets without factories: ${missingFactories.length}`);
console.log(`  unmapped Exalt catalog names: ${unmappedIncoming.length + unmappedOutgoing.length}`);

function printGroup(label, values) {
  if (values.length === 0) {
    return;
  }
  console.log(`\n${label}:`);
  for (const value of values) {
    console.log(`  ${value}`);
  }
}

printGroup('ID/type conflicts', conflicts);
printGroup('Direction conflicts', directionConflicts);
printGroup('Extractor mappings missing from realmlib', missingLocal);
printGroup('Local mappings absent from extractor', staleLocal);
printGroup('Mapped packets without factories', missingFactories);
printGroup('Unmapped incoming catalog names', unmappedIncoming);
printGroup('Unmapped outgoing catalog names', unmappedOutgoing);

const strictFailures = conflicts.length + directionConflicts.length + missingLocal.length;
if (strict && strictFailures > 0) {
  process.exitCode = 1;
}
if (requireComplete && (strictFailures > 0 || missingFactories.length > 0)) {
  process.exitCode = 1;
}
