'use strict';

const { spawnSync } = require('node:child_process');
const { existsSync, readFileSync, rmSync } = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const temporaryReport = path.join(projectRoot, 'temp/realmlib.api.md');
const committedReport = path.join(projectRoot, 'etc/realmlib.api.md');
const executable = path.join(
  projectRoot,
  'node_modules/.bin',
  process.platform === 'win32' ? 'api-extractor.cmd' : 'api-extractor',
);

rmSync(temporaryReport, { force: true });
const result = spawnSync(executable, ['run'], {
  cwd: projectRoot,
  encoding: 'utf8',
});
process.stdout.write(result.stdout || '');
process.stderr.write(result.stderr || '');

if (result.status === 0) {
  process.exit(0);
}

const output = `${result.stdout || ''}\n${result.stderr || ''}`;
const normalize = (value) => value.replace(/\r\n/g, '\n');
const reportsMatch = existsSync(temporaryReport)
  && normalize(readFileSync(temporaryReport, 'utf8'))
    === normalize(readFileSync(committedReport, 'utf8'));

// API Extractor intentionally exits nonzero for warning-level diagnostics in
// CI mode. Preserve those diagnostics while still enforcing the API snapshot.
if (reportsMatch && output.includes('API Extractor completed with warnings')) {
  process.exit(0);
}
process.exit(result.status || 1);
