/** /progress — Progress (Mobile App `progress`, README §9). Private. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { ProgressView } from '@/components/mock-site/account/progress-view';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteHeader } from '@/components/mock-site/site-header';
import { TabBar } from '@/components/mock-site/tab-bar';
import { NOINDEX } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'account.meta' });
  return { title: t('progress'), ...NOINDEX };
}

export default function Page({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['account', 'dashboard', 'qtypes']}>
      <SiteHeader active="progress" />
      <AppBar left="logo" lang flat />
      <ProgressView />
      <TabBar active="progress" />
    </PageShell>
  );
}
