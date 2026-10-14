/**
 * Player strings — every key comes from Sevara's `_player-texts.md`
 * (generated into strings.json by gen-strings.mjs; do not edit the JSON by hand).
 * `extra.ts` holds the handful of strings the file does not cover yet.
 * `ru.json` is the Russian column (mock.eduvo.uz instruction language) for every key above;
 * a missing Russian string falls back to English.
 */
import strings from './strings.json';
import ru from './ru.json';
import { EXTRA } from './extra';
import { SAT_TEXT } from './sat';

export type Locale = 'en' | 'uz' | 'ru';
export const isPlayerLocale = (v: unknown): v is Locale => v === 'en' || v === 'uz' || v === 'ru';
const RU = ru as Record<string, string>;
export type TextKey = keyof typeof strings | keyof typeof EXTRA | keyof typeof SAT_TEXT;
type Vars = Record<string, string | number>;

const ALL: Record<string, string[]> = { ...(strings as Record<string, string[]>), ...EXTRA, ...SAT_TEXT };

function fill(s: string, vars?: Vars): string {
  if (!vars) return s;
  let out = s;
  for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

export function t(key: TextKey, locale: Locale, vars?: Vars): string {
  const row = ALL[key];
  if (!row) return key;
  const s = locale === 'ru' ? RU[key] : row[locale === 'uz' ? 1 : 0];
  return fill(s || row[0], vars);
}

/** en/uz plural rule (§5): `_one` / `_other` in English, the `_other` form in Uzbek and Russian (number-neutral wording). */
export function tn(base: string, n: number, locale: Locale, vars?: Vars): string {
  const key = (locale === 'en' && n === 1 ? `${base}_one` : `${base}_other`) as TextKey;
  return t(key, locale, { n, ...vars });
}

/** Two-language message (T42): the interface language first, the other one second (ru → en). */
export function bi(key: TextKey, locale: Locale, vars?: Vars): [string, string] {
  const other: Locale = locale === 'en' ? 'uz' : 'en';
  return [t(key, locale, vars), t(key, other, vars)];
}

/** Bilingual plural. */
export function bin(base: string, n: number, locale: Locale, vars?: Vars): [string, string] {
  const other: Locale = locale === 'en' ? 'uz' : 'en';
  return [tn(base, n, locale, vars), tn(base, n, other, vars)];
}
