#!/usr/bin/env node
/**
 * messages/ check: every translated locale has exactly the English keys, the same {placeholders}
 * and the same <tags>; no file outside the TRANSLATED list (no placeholder copies). Exit 1 on error.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'messages');
const TRANSLATED = ['en', 'uz', 'ru'];
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flat(v, `${p}${k}.`) : [[`${p}${k}`, String(v)]]));
const tokens = (s) => [...s.matchAll(/\{(\w+)[,}]|<(\w+)>/g)].map((m) => m[1] || `<${m[2]}>`).sort().join(',');
let errors = 0;
const err = (m) => { errors++; console.error('✗', m); };

const locales = readdirSync(root).filter((d) => !d.startsWith('_'));
for (const l of locales) if (!TRANSLATED.includes(l)) err(`messages/${l}/ is not a reviewed locale (TRANSLATED in src/i18n/locales.ts)`);
const nss = readdirSync(join(root, 'en')).filter((f) => f.endsWith('.json'));
for (const ns of nss) {
  const en = new Map(flat(JSON.parse(readFileSync(join(root, 'en', ns), 'utf8'))));
  for (const l of TRANSLATED.filter((x) => x !== 'en')) {
    let other;
    try { other = new Map(flat(JSON.parse(readFileSync(join(root, l, ns), 'utf8')))); } catch { err(`${l}/${ns} missing`); continue; }
    for (const k of en.keys()) if (!other.has(k)) err(`${l}/${ns}: missing ${k}`);
    for (const k of other.keys()) if (!en.has(k)) err(`${l}/${ns}: extra ${k}`);
    for (const [k, v] of en) if (other.has(k) && tokens(v) !== tokens(other.get(k))) err(`${l}/${ns}: ${k} placeholders differ (${tokens(v)} vs ${tokens(other.get(k))})`);
  }
}
// score copy rule (README): never hedge about scores, in any language
const HEDGE = /estimat|approximat|±|taxminiy|тахмин|примерн|приблизительн|ориентировочн/i;
for (const l of TRANSLATED) for (const ns of nss) {
  try {
    for (const [k, v] of flat(JSON.parse(readFileSync(join(root, l, ns), 'utf8')))) if (HEDGE.test(v)) err(`${l}/${ns}: ${k} hedges about scores ("${v.slice(0, 60)}")`);
  } catch { /* reported above */ }
}
if (errors) { console.error(`${errors} i18n error(s)`); process.exit(1); }
console.log(`i18n ok: ${nss.length} namespaces × ${TRANSLATED.length} locales`);
