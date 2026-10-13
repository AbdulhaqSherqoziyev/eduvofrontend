/** sitemap.xml for mock.eduvo.uz only: reviewed locales × public pages, with hreflang alternates. */
import { headers } from 'next/headers';
import { TRANSLATED, htmlLang } from '@/i18n/locales';
import { INDEXABLE_PAGES, MOCK_ORIGIN, MOCK_PROD_HOST } from '@/lib/mock/seo';

export const dynamic = 'force-dynamic';

export function GET() {
  const host = (headers().get('host') ?? '').toLowerCase().replace(/:\d+$/, '');
  if (host !== MOCK_PROD_HOST) return new Response('Not found', { status: 404 });
  const urls = INDEXABLE_PAGES.flatMap((path) =>
    TRANSLATED.map((lang) => {
      const alt = TRANSLATED.map((l) => `    <xhtml:link rel="alternate" hreflang="${htmlLang(l)}" href="${MOCK_ORIGIN}/${l}${path}"/>`).join('\n');
      return `  <url>\n    <loc>${MOCK_ORIGIN}/${lang}${path}</loc>\n${alt}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${MOCK_ORIGIN}/en${path}"/>\n  </url>`;
    }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
