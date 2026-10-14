/** /ielts — exam SEO page (README §2, specification only). Static per locale; price ISR from the catalog. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { ExamPageDesktop } from '@/components/mock-site/exam-page';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { StickyCta } from '@/components/mock-site/sticky-cta';
import { CatalogProvider } from '@/lib/mock/catalog';
import { CATALOG_REVALIDATE, fetchCatalogServer } from '@/lib/mock/catalog-server';
import { publicPageMeta } from '@/lib/mock/seo';

export const revalidate = CATALOG_REVALIDATE;

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'exams.ielts.meta' });
  return publicPageMeta(lang, '/ielts', { title: t('title'), description: t('description') });
}

export default async function ExamPage({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  const t = await getTranslations('exams.common');
  const catalog = await fetchCatalogServer();
  return (
    <PageShell ns={['landing']}>
      <CatalogProvider initial={catalog}>
        <SiteHeader active="ielts" />
        <AppBar left="back" title="IELTS Academic" />
        <main className="m-main m-with-cta-phone">
          <ExamPageDesktop exam="ielts" />
        </main>
        <SiteFooter />
        <StickyCta secondary={{ label: t('tryFree'), href: `/${lang}/start/ielts?mode=section` }} primary={{ label: t('startFull'), href: `/${lang}/start/ielts?mode=full` }} />
      </CatalogProvider>
    </PageShell>
  );
}
