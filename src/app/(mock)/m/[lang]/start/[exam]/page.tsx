/** /{lang}/start/{ielts|sat|TEST-CODE} — Exam start (Exam Start.dc.html, Mobile App `start`). Private. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteHeader } from '@/components/mock-site/site-header';
import { StartView } from '@/components/mock-site/start/start-view';
import { NOINDEX } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'start.meta' });
  return { title: t('title'), ...NOINDEX };
}

export default function StartPage({ params: { lang, exam } }: { params: { lang: MockLocale; exam: string } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['start']}>
      <SiteHeader active="mocks" />
      <StartView examParam={exam} />
    </PageShell>
  );
}
