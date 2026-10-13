/** /{lang}/sample-result — the public sample from the landing ("See a sample result"). Labelled "Sample". */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { PageShell } from '@/components/mock-site/page-shell';
import { ResultsView } from '@/components/mock-site/results/results-view';
import { SAMPLE_RESULT } from '@/components/mock-site/results/sample';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { pageMeta } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'results.meta' });
  return { title: t('sample'), ...pageMeta(lang, '/sample-result') };
}

export default function SampleResultPage({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['results', 'qtypes']}>
      <SiteHeader />
      <ResultsView sample={SAMPLE_RESULT} />
      <SiteFooter />
    </PageShell>
  );
}
