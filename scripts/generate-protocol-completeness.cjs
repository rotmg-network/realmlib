#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { protocolCompleteness } = require('../lib/packet-registry');

const catalogHelpers = new Set([
  'GroundTileData',
  'ObjectData',
  'ObjectStatusData',
  'ResultDefinitionMessage',
  'StatData',
  'UserData',
]);

function definitionLabel(definition) {
  const id = definition.id === undefined ? 'idless' : String(definition.id);
  return `- \`${definition.direction}:${id}\` — \`${definition.type}\``;
}

function generateProtocolCompleteness(catalog) {
  const groups = protocolCompleteness();
  const catalogNames = [
    ...(catalog.unmapped_incoming ?? []),
    ...(catalog.unmapped_outgoing ?? []),
  ];
  const helpers = catalogNames.filter((name) => catalogHelpers.has(name)).sort();
  const candidates = catalogNames.filter((name) => !catalogHelpers.has(name)).sort();
  const generated = [
    '# Protocol completeness',
    '',
    `Generated from the canonical registry and Exalt ${catalog.exalt_version}.`,
    '',
    'This taxonomy does not assume that every embedded client class is a wire',
    'packet. Factory-less definitions remain raw or research-only until framing',
    'and layout evidence exists.',
    '',
    '## Summary',
    '',
    '| Category | Count | Meaning |',
    '| --- | ---: | --- |',
    `| Modeled wire packets | ${groups['modeled-wire'].length} | One-byte id, known direction, packet factory |`,
    `| Deliberately raw wire packets | ${groups['raw-wire'].length} | One-byte id/direction known; layout not modeled |`,
    `| Registry research candidates | ${groups['research-candidate'].length} | One-byte id retained with unresolved direction/layout |`,
    `| Legacy/non-wire metadata | ${groups['legacy-metadata'].length} | Cannot be an active one-byte wire id |`,
    `| Modeled id-less transports | ${groups['modeled-transport'].length} | Separate transport/handshake packet without a game-wire id |`,
    `| Catalog nested/helper classes | ${helpers.length} | Embedded class, not treated as a wire packet |`,
    `| Catalog research names | ${candidates.length} | Not presumed to be packets without further evidence |`,
    '',
  ];

  for (const [title, key] of [
    ['Deliberately raw wire packets', 'raw-wire'],
    ['Registry research candidates', 'research-candidate'],
    ['Legacy/non-wire metadata', 'legacy-metadata'],
    ['Modeled id-less transports', 'modeled-transport'],
  ]) {
    generated.push(`## ${title}`, '');
    generated.push(...groups[key].map(definitionLabel), '');
  }

  generated.push(
    '## Catalog nested/helper classes',
    '',
    ...helpers.map((name) => `- \`${name}\``),
    '',
    '## Catalog research names',
    '',
    'These names are extraction leads only. Some are alternate names for modeled',
    'packets; others may be nested/native classes. They are not completeness',
    'failures until a wire id, direction, and framing are established.',
    '',
    ...candidates.map((name) => `- \`${name}\``),
    '',
  );
  return generated.join('\n');
}

function main(args = process.argv.slice(2)) {
  const [catalogPath = 'protocol/exalt-current.json', outputPath = 'docs/PROTOCOL_COMPLETENESS.md'] = args;
  const catalog = JSON.parse(fs.readFileSync(path.resolve(catalogPath), 'utf8'));
  fs.writeFileSync(path.resolve(outputPath), generateProtocolCompleteness(catalog));
}

if (require.main === module) {
  main();
}

module.exports = { generateProtocolCompleteness, main };
