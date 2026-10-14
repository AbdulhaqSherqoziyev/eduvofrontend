/**
 * Unknown `/{lang}/…` paths and every non-mock path on the mock host (the middleware rewrites those
 * here with HTTP 404). Renders the 404 UI directly: Next 14.2 with two root layouts SSR-renders
 * notFound() as a bare `__next_error__` shell. README §13: the normal header and footer around a
 * centered card with the code, a plain message and one primary action.
 */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AppBar } from '@/components/mock-site/app-bar';
import { NotFoundCard } from '@/components/mock-site/not-found-card';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { NOINDEX } from '@/lib/mock/seo';

export const dynamicParams = true;
export const metadata: Metadata = { ...NOINDEX, title: '404' };

export default function MockMissing({ params: { lang } }: { params: { lang: string } }) {
  setRequestLocale(lang);
  return (
    <PageShell>
      <SiteHeader />
      <AppBar left="logo" lang login flat />
      <NotFoundCard />
      <SiteFooter />
    </PageShell>
  );
}
