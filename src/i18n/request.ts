/**
 * next-intl request config for the mock site. English is the source; a translated locale is
 * deep-merged over it, so any missing key shows English. Locales without message files (see
 * TRANSLATED) get English as a whole — no placeholder copies are shipped.
 */
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, isLocale, isTranslated } from './locales';
import { NAMESPACES } from './namespaces';

type Messages = Record<string, unknown>;

async function load(locale: string): Promise<Messages> {
  const parts = await Promise.all(
    NAMESPACES.map(async (ns) => [ns, (await import(`../../messages/${locale}/${ns}.json`)).default] as const),
  );
  return Object.fromEntries(parts);
}

function deepMerge(base: Messages, over: Messages): Messages {
  const out: Messages = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = base[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' ? deepMerge(b as Messages, v as Messages) : v;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  const en = await load('en');
  const messages = locale !== 'en' && isTranslated(locale) ? deepMerge(en, await load(locale)) : en;
  return { locale, messages, timeZone: 'Asia/Tashkent' };
});
