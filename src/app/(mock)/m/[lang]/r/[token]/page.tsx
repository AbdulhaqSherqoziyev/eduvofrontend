/** /{lang}/r/{token} — public result card from a share link (R4). noindex; robots.txt disallows the r/ paths. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { PageShell } from '@/components/mock-site/page-shell';
import { SharedResult } from '@/components/mock-site/results/shared-result';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { NOINDEX, socialMeta } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang, token } }: { params: { lang: MockLocale; token: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'results.sharePage' });
  return { title: t('title'), description: t('body'), ...NOINDEX, ...socialMeta(lang, { title: t('title'), description: t('body'), path: `/r/${token}` }) };
}

export default function SharedResultPage({ params: { lang, token } }: { params: { lang: MockLocale; token: string } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['results']}>
      <SiteHeader />
      <AppBar left="logo" lang login flat />
      <SharedResult token={token} />
      <SiteFooter />
    </PageShell>
  );
}
