'use strict';

const { execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const maximumFiles = 700;
const maximumUnpackedBytes = 3_000_000;
let archivePath;
let installRoot;

try {
  const packOutput = execFileSync(npmCommand, ['pack', '--json', '--ignore-scripts'], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  const [packed] = JSON.parse(packOutput);
  if (!packed || typeof packed.filename !== 'string') {
    throw new Error('npm pack did not return package metadata');
  }
  archivePath = path.join(projectRoot, packed.filename);
  if (packed.entryCount > maximumFiles) {
    throw new Error(`package contains ${packed.entryCount} files; limit is ${maximumFiles}`);
  }
  if (packed.unpackedSize > maximumUnpackedBytes) {
    throw new Error(
      `package unpacks to ${packed.unpackedSize} bytes; limit is ${maximumUnpackedBytes}`,
    );
  }

  installRoot = mkdtempSync(path.join(tmpdir(), 'realmlib-package-smoke-'));
  writeFileSync(
    path.join(installRoot, 'package.json'),
    JSON.stringify({ name: 'realmlib-package-smoke', private: true }),
  );
  execFileSync(
    npmCommand,
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', archivePath],
    { cwd: installRoot, stdio: 'pipe' },
  );

  const requireFromInstall = createRequire(path.join(installRoot, 'smoke.cjs'));
  const root = requireFromInstall('realmlib');
  for (const entryPoint of ['core', 'protocol', 'packets', 'models', 'data']) {
    requireFromInstall(`realmlib/${entryPoint}`);
  }
  if (typeof root.PacketIO !== 'function' || typeof root.createPacket !== 'function') {
    throw new Error('installed root export is missing PacketIO or createPacket');
  }

  const installedPackage = JSON.parse(
    readFileSync(path.join(installRoot, 'node_modules/realmlib/package.json'), 'utf8'),
  );
  console.log(
    `package smoke passed: ${installedPackage.name}@${installedPackage.version}, ` +
      `${packed.entryCount} files, ${packed.unpackedSize} unpacked bytes`,
  );
} finally {
  if (archivePath) {
    rmSync(archivePath, { force: true });
  }
  if (installRoot) {
    rmSync(installRoot, { recursive: true, force: true });
  }
}
