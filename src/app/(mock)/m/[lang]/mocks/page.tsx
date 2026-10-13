/** /mocks — My mocks (Mobile App `mocks`). Private. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { MocksView } from '@/components/mock-site/account/mocks-view';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteHeader } from '@/components/mock-site/site-header';
import { TabBar } from '@/components/mock-site/tab-bar';
import { NOINDEX } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'account.meta' });
  return { title: t('mocks'), ...NOINDEX };
}

export default function Page({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['account', 'dashboard', 'qtypes']}>
      <SiteHeader active="mocks" />
      <AppBar left="logo" lang flat />
      <MocksView />
      <TabBar active="mocks" />
    </PageShell>
  );
}
