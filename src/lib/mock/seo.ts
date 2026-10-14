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

/** og:locale per translated locale (Facebook format). */
const OG_LOCALE: Record<string, string> = { en: 'en_US', uz: 'uz_UZ', ru: 'ru_RU' };

/** Share image (1200×630, public/brand/): localized for reviewed translations, English otherwise. */
export const ogImageFor = (lang: string) => (isTranslated(lang) && lang !== 'en' ? `/brand/og-image-${lang}.png` : '/brand/og-image.png');

/**
 * Open Graph + Twitter card for a page. `title` is the page title without the " · Eduvo Mock"
 * suffix (`absolute` = already complete, e.g. the landing title).
 */
export function socialMeta(lang: MockLocale, o: { title: string; description: string; path: string; absolute?: boolean }): Pick<Metadata, 'openGraph' | 'twitter'> {
  const title = o.absolute ? o.title : `${o.title} · Eduvo Mock`;
  const ogLocale = OG_LOCALE[isTranslated(lang) ? lang : 'en'];
  const image = { url: ogImageFor(lang), width: 1200, height: 630, alt: 'Eduvo Mock' };
  return {
    openGraph: {
      type: 'website',
      siteName: 'Eduvo Mock',
      title,
      description: o.description,
      url: `/${isTranslated(lang) ? lang : 'en'}${o.path}`,
      locale: ogLocale,
      alternateLocale: TRANSLATED.filter((l) => OG_LOCALE[l] !== ogLocale).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description: o.description, images: [image.url] },
  };
}

/** Everything a public marketing page needs: title, description, canonical/hreflang, OG, Twitter. */
export function publicPageMeta(lang: MockLocale, path: string, o: { title: string; description: string; absolute?: boolean }): Metadata {
  return {
    title: o.absolute ? { absolute: o.title } : o.title,
    description: o.description,
    ...pageMeta(lang, path),
    ...socialMeta(lang, { ...o, path }),
  };
}

/** Private pages (dashboard, checkout, results…): never indexed. */
export const NOINDEX: Pick<Metadata, 'robots'> = { robots: { index: false, follow: false } };
