/**
 * Verifies .env is readable the same way as app.config.js (@expo/env).
 */
const path = require('path');
const fs = require('fs');
const { parseProjectEnv } = require('@expo/env');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

if (!fs.existsSync(envPath)) {
  console.error('No .env at expected path:');
  console.error('  ' + envPath);
  console.error('  cp .env.example .env  and set at least:');
  console.error('  EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL / SUPABASE_ANON_KEY)');
  process.exit(1);
}

const { env: e, files } = parseProjectEnv(root, { silent: true });
if (!e || !Object.keys(e).length) {
  console.error('No variables parsed from .env files. Tried:', files);
  process.exit(1);
}

const url = e.SUPABASE_URL || e.EXPO_PUBLIC_SUPABASE_URL;
const key = e.SUPABASE_ANON_KEY || e.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const okU = url && String(url).trim();
const okK = key && String(key).trim();

console.log('Parsed env from:', (files && files.length ? files : ['(none)']).join(', '));
console.log('Supabase URL:', okU ? `OK (${String(url).length} chars)` : 'missing');
console.log('Supabase anon key:', okK ? `OK (${String(key).length} chars)` : 'missing');
console.log('');

if (!okU || !okK) {
  console.error('Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env (or SUPABASE_URL / SUPABASE_ANON_KEY).');
  process.exit(1);
}

console.log('All set. Restart Metro with: npx expo start -c');
process.exit(0);
