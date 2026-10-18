/**
 * robots.txt per host. mock.eduvo.uz: public marketing pages only; other mock hosts (dev): nothing.
 * admin-mock hosts: `Disallow: /`. ERP hosts keep their old behaviour (no robots.txt → 404).
 */
import { headers } from 'next/headers';
import { MOCK_ORIGIN, MOCK_PROD_HOST } from '@/lib/mock/seo';
import { isAdminMockHost, isMockHost } from '@/lib/routing/hosts';

export const dynamic = 'force-dynamic';

export function GET() {
  const host = (headers().get('host') ?? '').toLowerCase().replace(/:\d+$/, '');
  // admin-mock.*: never indexed (the middleware also sends X-Robots-Tag on every response)
  if (isAdminMockHost(host)) return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
  if (!isMockHost(host)) return new Response('Not found', { status: 404 });
  const body = host === MOCK_PROD_HOST
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /*/dashboard',
        'Disallow: /*/mocks',
        'Disallow: /*/progress',
        'Disallow: /*/account',
        'Disallow: /*/start',
        'Disallow: /*/exam/',
        'Disallow: /*/results/',
        'Disallow: /*/checkout',
        'Disallow: /*/onboarding',
        'Disallow: /*/verify',
        'Disallow: /*/reset',
        'Disallow: /*/r/',
        'Disallow: /api/',
        '',
        `Sitemap: ${MOCK_ORIGIN}/sitemap.xml`,
        '',
      ].join('\n')
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
