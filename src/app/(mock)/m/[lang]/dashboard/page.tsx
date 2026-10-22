/** /{lang}/dashboard — learner home (Dashboard.dc.html, Mobile App `home`). Private. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { DashboardView } from '@/components/mock-site/dashboard/dashboard-view';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteHeader } from '@/components/mock-site/site-header';
import { TabBar } from '@/components/mock-site/tab-bar';
import { NOINDEX } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'dashboard.meta' });
  return { title: t('title'), ...NOINDEX };
}

export default function DashboardPage({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['dashboard', 'qtypes', 'leaderboard', 'account']}>
      <SiteHeader active="dash" />
      <AppBar left="logo" lang flat />
      <DashboardView />
      <TabBar active="home" />
    </PageShell>
  );
}
