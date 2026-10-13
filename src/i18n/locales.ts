/**
 * mock.eduvo.uz locales — the 40 languages of design/mock-site/README.md "Language switcher", in
 * that order. URL segment is lowercase (`/zh-hans/`); `<html lang>` gets the BCP 47 tag.
 * Edge-safe (used by the middleware): no Node APIs, no imports.
 */
export const LOCALES = [
  'en', 'uz', 'uz-cyrl', 'ru', 'kk', 'ky', 'tg', 'tk', 'tr', 'az',
  'ar', 'fa', 'ur', 'he', 'hi', 'bn', 'zh-hans', 'zh-hant', 'ja', 'ko',
  'id', 'ms', 'vi', 'th', 'fil', 'de', 'fr', 'es', 'pt', 'it',
  'nl', 'pl', 'uk', 'ro', 'cs', 'hu', 'el', 'sv', 'sw', 'mn',
] as const;
export type MockLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: MockLocale = 'en';

/**
 * Locales with reviewed message files (`messages/{locale}/*.json`). Every other locale renders the
 * English text until its translation lands; those pages are `noindex` and stay out of the sitemap
 * and hreflang, so search engines do not index 37 copies of the English site.
 */
export const TRANSLATED: readonly MockLocale[] = ['en', 'uz', 'ru'];
export const isTranslated = (l: string) => (TRANSLATED as readonly string[]).includes(l);

export const RTL_LOCALES: ReadonlySet<string> = new Set(['ar', 'fa', 'ur', 'he']);

/** Each language's own name, in its own script (no flags). */
export const LOCALE_NAMES: Record<MockLocale, string> = {
  en: 'English', uz: 'O‘zbekcha', 'uz-cyrl': 'Ўзбекча', ru: 'Русский', kk: 'Қазақша', ky: 'Кыргызча', tg: 'Тоҷикӣ', tk: 'Türkmençe', tr: 'Türkçe', az: 'Azərbaycanca',
  ar: 'العربية', fa: 'فارسی', ur: 'اردو', he: 'עברית', hi: 'हिन्दी', bn: 'বাংলা', 'zh-hans': '简体中文', 'zh-hant': '繁體中文', ja: '日本語', ko: '한국어',
  id: 'Bahasa Indonesia', ms: 'Bahasa Melayu', vi: 'Tiếng Việt', th: 'ไทย', fil: 'Filipino', de: 'Deutsch', fr: 'Français', es: 'Español', pt: 'Português', it: 'Italiano',
  nl: 'Nederlands', pl: 'Polski', uk: 'Українська', ro: 'Română', cs: 'Čeština', hu: 'Magyar', el: 'Ελληνικά', sv: 'Svenska', sw: 'Kiswahili', mn: 'Монгол',
};

const BCP47: Partial<Record<MockLocale, string>> = { 'uz-cyrl': 'uz-Cyrl', 'zh-hans': 'zh-Hans', 'zh-hant': 'zh-Hant' };
/** `<html lang>` value (BCP 47 casing, so `:lang(zh-Hant)` CSS matches). */
export const htmlLang = (l: MockLocale) => BCP47[l] ?? l;
export const dirOf = (l: string): 'rtl' | 'ltr' => (RTL_LOCALES.has(l) ? 'rtl' : 'ltr');
export const isLocale = (v: unknown): v is MockLocale => typeof v === 'string' && (LOCALES as readonly string[]).includes(v);

/** Short code for the phone app-bar language pill ("EN", "UZ", …). */
export function langShort(l: MockLocale): string {
  if (l === 'uz-cyrl') return 'ЎЗ';
  if (l === 'zh-hans') return '简';
  if (l === 'zh-hant') return '繁';
  return l.toUpperCase();
}

/** Intl locale with Latin digits forced (ar/fa would otherwise print ٦٫٥ / ۶٫۵). */
export const numLocale = (l: string) => `${htmlLang(isLocale(l) ? l : DEFAULT_LOCALE)}-u-nu-latn`;

/** Accept-Language → best supported locale (exact, then script/region rules, then base language). */
export function negotiate(header: string | null): MockLocale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(',')
    .map((p) => {
      const [tag, ...params] = p.trim().split(';');
      const q = params.map((x) => x.trim()).find((x) => x.startsWith('q='));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .filter((x) => x.tag && x.tag !== '*' && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    if (isLocale(tag)) return tag;
    if (tag.startsWith('zh')) return /tw|hk|mo|hant/.test(tag) ? 'zh-hant' : 'zh-hans';
    if (tag.startsWith('uz') && tag.includes('cyrl')) return 'uz-cyrl';
    if (tag === 'tl' || tag.startsWith('tl-')) return 'fil';
    if (tag === 'iw' || tag.startsWith('iw-')) return 'he';
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
