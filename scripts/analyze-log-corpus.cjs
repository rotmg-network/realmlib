/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const realm = require('../lib');

const root = process.argv[2];
const output = process.argv[3];
if (!root || !output) {
  console.error('usage: node scripts/analyze-log-corpus.js <log-directory> <output.json>');
  process.exit(1);
}

const capAdd = (array, value, cap = 12) => {
  if (!array.includes(value) && array.length < cap) array.push(value);
};

function counterInc(object, key, amount = 1) {
  object[key] = (object[key] || 0) + amount;
}

function packetSummary() {
  return { count: 0, minBody: null, maxBody: 0, originalStatuses: {}, currentStatuses: {}, samples: [] };
}

function statSummary() {
  return { count: 0, stringCount: 0, numericCount: 0, min: null, max: null, values: [], objectTypes: [] };
}

function parseCurrent(record) {
  const type = realm.DEFAULT_PACKET_MAP[record.id];
  if (!type) return { status: 'unmapped', type: `UNKNOWN_${record.id}` };
  let packet;
  try {
    packet = realm.createPacket(type);
  } catch (error) {
    return { status: 'nofactory', type, error: String(error) };
  }
  try {
    const body = Buffer.from(record.body || '', 'hex');
    const reader = new realm.Reader(body.length);
    body.copy(reader.buffer);
    reader.index = 0;
    packet.read(reader);
    return { status: reader.remaining ? 'leftover' : 'ok', type, packet, leftover: reader.remaining };
  } catch (error) {
    return { status: 'error', type, error: String(error).split('\n')[0] };
  }
}

function recordStats(report, packet, type) {
  const add = (stat, objectType) => {
    const key = String(stat.statType);
    const summary = report.stats[key] || (report.stats[key] = statSummary());
    summary.count++;
    if (stat.isStringStat()) {
      summary.stringCount++;
      capAdd(summary.values, stat.stringStatValue, 20);
    } else {
      summary.numericCount++;
      summary.min = summary.min === null ? stat.statValue : Math.min(summary.min, stat.statValue);
      summary.max = summary.max === null ? stat.statValue : Math.max(summary.max, stat.statValue);
      capAdd(summary.values, stat.statValue, 20);
    }
    if (objectType !== undefined) capAdd(summary.objectTypes, objectType, 30);
  };
  if (type === realm.PacketType.UPDATE) {
    for (const object of packet.newObjects || []) {
      for (const stat of object.status?.stats || []) add(stat, object.objectType);
    }
  } else if (type === realm.PacketType.NEWTICK) {
    for (const status of packet.statuses || []) {
      for (const stat of status.stats || []) add(stat, undefined);
    }
  }
}

async function analyzePacketFile(file, global) {
  const report = {
    kind: 'packets', bytes: fs.statSync(file).size, records: 0, invalidJson: 0,
    connections: [], firstTime: null, lastTime: null, packets: {}, unresolved: {},
    modified: 0, dropped: 0, injected: 0,
  };
  const connections = new Set();
  const input = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const line of input) {
    if (!line.trim()) continue;
    let record;
    try { record = JSON.parse(line); } catch (_) { report.invalidJson++; continue; }
    report.records++;
    connections.add(record.connId || 0);
    if (typeof record.time === 'number') {
      report.firstTime = report.firstTime === null ? record.time : Math.min(report.firstTime, record.time);
      report.lastTime = report.lastTime === null ? record.time : Math.max(report.lastTime, record.time);
    }
    if (record.modified) report.modified++;
    if (record.dropped) report.dropped++;
    if (record.injected) report.injected++;
    const current = parseCurrent(record);
    const key = `${record.dir}|${record.id}|${current.type}`;
    const summary = report.packets[key] || (report.packets[key] = packetSummary());
    summary.count++;
    const bodyLength = (record.body || '').length / 2;
    summary.minBody = summary.minBody === null ? bodyLength : Math.min(summary.minBody, bodyLength);
    summary.maxBody = Math.max(summary.maxBody, bodyLength);
    counterInc(summary.originalStatuses, record.status || 'missing');
    counterInc(summary.currentStatuses, current.status);
    capAdd(summary.samples, record.body || '', 3);
    const globalSummary = global.packets[key] || (global.packets[key] = packetSummary());
    globalSummary.count++;
    globalSummary.minBody = globalSummary.minBody === null ? bodyLength : Math.min(globalSummary.minBody, bodyLength);
    globalSummary.maxBody = Math.max(globalSummary.maxBody, bodyLength);
    counterInc(globalSummary.originalStatuses, record.status || 'missing');
    counterInc(globalSummary.currentStatuses, current.status);
    capAdd(globalSummary.samples, record.body || '', 3);
    if (current.status !== 'ok') {
      const unresolvedKey = `${key}|${current.status}|${current.leftover || 0}|${current.error || ''}`;
      const unresolved = report.unresolved[unresolvedKey] || (report.unresolved[unresolvedKey] = { count: 0, sample: record.body || '' });
      unresolved.count++;
      const globalUnresolved = global.unresolved[unresolvedKey] || (global.unresolved[unresolvedKey] = { count: 0, sample: record.body || '', files: [] });
      globalUnresolved.count++;
      capAdd(globalUnresolved.files, path.basename(file), 30);
    }
    if (current.packet) {
      recordStats(global, current.packet, current.type);
      if (current.type === realm.PacketType.MAPINFO) {
        capAdd(global.mapNames, current.packet.name, 100);
        capAdd(global.buildVersions, current.packet.buildVersion, 20);
      }
      if (current.type === realm.PacketType.PROGRESS_UPDATE) capAdd(global.progressValues, current.packet.value, 100);
      if (current.type === realm.PacketType.CREATE) capAdd(global.createBodies, record.body || '', 30);
      if (current.type === realm.PacketType.SHOWEFFECT) capAdd(global.showEffects, current.packet.effectType ?? current.packet.effect, 100);
      if (current.type === realm.PacketType.NOTIFICATION) capAdd(global.notificationEffects, current.packet.effect, 100);
    }
  }
  report.connections = [...connections].sort((a, b) => a - b);
  return report;
}

async function analyzeAppEngineFile(file, global) {
  const report = { kind: 'appengine', bytes: fs.statSync(file).size, records: 0, invalidJson: 0, endpoints: {}, statuses: {}, responseRoots: {} };
  const input = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const line of input) {
    if (!line.trim()) continue;
    let record;
    try { record = JSON.parse(line); } catch (_) { report.invalidJson++; continue; }
    report.records++;
    const endpoint = `${record.method || '?'} ${record.url || '?'}`;
    counterInc(report.endpoints, endpoint);
    counterInc(global.endpoints, endpoint);
    counterInc(report.statuses, String(record.status));
    const root = /^\s*<([A-Za-z0-9_:-]+)/.exec(record.resBody || '')?.[1];
    if (root) {
      counterInc(report.responseRoots, root);
      counterInc(global.responseRoots, root);
    }
  }
  return report;
}

async function main() {
  const names = fs.readdirSync(root).sort();
  const global = {
    packets: {}, unresolved: {}, stats: {}, endpoints: {}, responseRoots: {}, mapNames: [],
    buildVersions: [], progressValues: [], createBodies: [], showEffects: [], notificationEffects: [],
  };
  const files = {};
  for (const name of names) {
    const file = path.join(root, name);
    if (!fs.statSync(file).isFile()) continue;
    if (name.endsWith('.md')) {
      files[name] = { kind: 'findings', bytes: fs.statSync(file).size };
    } else if (name.endsWith('-appengine.ndjson')) {
      files[name] = await analyzeAppEngineFile(file, global);
    } else if (name.endsWith('.ndjson')) {
      files[name] = await analyzePacketFile(file, global);
    }
    console.error(`analyzed ${name}`);
  }
  fs.writeFileSync(output, JSON.stringify({ generatedAt: new Date().toISOString(), root, files, global }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
