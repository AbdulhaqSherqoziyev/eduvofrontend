// Regenerate strings.json from Sevara's `_player-texts.md`:
//   node src/lib/exam/i18n/gen-strings.mjs ../.claude/specs/exams/_player-texts.md
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const src = process.argv[2];
if (!src) throw new Error('usage: gen-strings.mjs <path to _player-texts.md>');
const out = {};
for (const line of readFileSync(src, 'utf8').split('\n')) {
  const m = line.match(/^\|\s*([a-z_]+\.[a-z0-9_]+)\s*\|(.*)\|(.*)\|\s*$/);
  if (!m) continue;
  out[m[1]] = [m[2].trim(), m[3].trim()];
}
const dest = join(dirname(fileURLToPath(import.meta.url)), 'strings.json');
writeFileSync(dest, JSON.stringify(out, null, 1) + '\n');
console.log(Object.keys(out).length, 'keys →', dest);
