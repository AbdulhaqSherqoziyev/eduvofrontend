/** SEO helpers for the mock site: canonical origin, indexable pages, hreflang alternates. */
import type { Metadata } from 'next';
import { TRANSLATED, htmlLang, isTranslated, type MockLocale } from '@/i18n/locales';

/** The only host that may be indexed; dev/staging mock hosts answer `Disallow: /`. */
export const MOCK_PROD_HOST = 'mock.eduvo.uz';
export const MOCK_ORIGIN = `https://${MOCK_PROD_HOST}`;

/** Public marketing pages (path after `/{lang}`) that go into sitemap.xml. */
export const INDEXABLE_PAGES = ['', '/ielts', '/sat', '/pricing', '/how-it-works', '/help', '/help/contact', '/terms', '/privacy', '/refunds', '/cookies'] as const;

/**
 * canonical + hreflang for a page. Only reviewed translations are listed as alternates; a locale
 * that still shows the English fallback is `noindex` and points its canonical at `/en`.
 */
export function pageMeta(lang: MockLocale, path: string): Pick<Metadata, 'metadataBase' | 'alternates' | 'robots'> {
  const translated = isTranslated(lang);
  return {
    metadataBase: new URL(MOCK_ORIGIN),
    alternates: {
      canonical: `/${translated ? lang : 'en'}${path}`,
      languages: { ...Object.fromEntries(TRANSLATED.map((l) => [htmlLang(l), `/${l}${path}`])), 'x-default': `/en${path}` },
    },
    robots: translated ? undefined : { index: false, follow: true },
  };
}

/** Private pages (dashboard, checkout, results…): never indexed. */
export const NOINDEX: Pick<Metadata, 'robots'> = { robots: { index: false, follow: false } };
