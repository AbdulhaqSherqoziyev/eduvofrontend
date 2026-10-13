/** Pricing (Pricing.dc.html ≥520, Mobile App.dc.html `pricing` <520). Static per locale; prices ISR from the catalog. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { PageShell } from '@/components/mock-site/page-shell';
import { PricingView } from '@/components/mock-site/pricing/pricing-view';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { CatalogProvider } from '@/lib/mock/catalog';
import { CATALOG_REVALIDATE, fetchCatalogServer } from '@/lib/mock/catalog-server';
import { pageMeta } from '@/lib/mock/seo';

export const revalidate = CATALOG_REVALIDATE;

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'pricing.meta' });
  return { title: t('title'), description: t('description'), ...pageMeta(lang, '/pricing') };
}

export default async function PricingPage({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  const t = await getTranslations('pricing.phone');
  const catalog = await fetchCatalogServer();
  return (
    <PageShell ns={['pricing', 'landing']}>
      <CatalogProvider initial={catalog}>
        <SiteHeader active="pricing" />
        <AppBar left="back" title={t('title')} />
        <PricingView />
        <SiteFooter />
      </CatalogProvider>
    </PageShell>
  );
}
