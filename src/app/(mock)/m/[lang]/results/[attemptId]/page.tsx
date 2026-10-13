/** /{lang}/results/{attemptId} — Results.dc.html / Mobile App `results`. Private. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { PageShell } from '@/components/mock-site/page-shell';
import { ResultsGate } from '@/components/mock-site/results/results-gate';
import { SiteHeader } from '@/components/mock-site/site-header';
import { NOINDEX } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'results.meta' });
  return { title: t('title'), ...NOINDEX };
}

export default function ResultsPage({ params: { lang, attemptId } }: { params: { lang: MockLocale; attemptId: string } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['results', 'qtypes']}>
      <SiteHeader active="progress" />
      <ResultsGate attemptId={attemptId} />
    </PageShell>
  );
}
