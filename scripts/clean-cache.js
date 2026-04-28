#!/usr/bin/env node
/**
 * Remove local Expo / Metro / tooling caches. Safe to re-run.
 * After this, start the dev server with: npx expo start -c
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = path.join(__dirname, '..');

function rm(p) {
  if (!p || !fs.existsSync(p)) return;
  try {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('Removed:', path.relative(root, p) || p);
  } catch (e) {
    console.warn('Could not remove', p, e.message);
  }
}

rm(path.join(root, '.expo'));
rm(path.join(root, 'node_modules', '.cache'));

// React Native / Metro (when present in system temp)
try {
  const tmp = os.tmpdir();
  for (const name of fs.readdirSync(tmp, { withFileTypes: true })) {
    if (name.isDirectory() && name.name.startsWith('metro-')) {
      rm(path.join(tmp, name.name));
    }
  }
} catch {
  // ignore
}

console.log('\nCache cleanup done. Start with a fresh Metro cache:');
console.log('  npx expo start -c\n');
