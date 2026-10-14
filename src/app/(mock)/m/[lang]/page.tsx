/** Landing (Landing.dc.html ≥520, Mobile App.dc.html `landing` <520). Static per locale; prices ISR from the catalog. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { LandingDesktop } from '@/components/mock-site/landing/landing-desktop';
import { LandingPhone } from '@/components/mock-site/landing/landing-phone';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { StickyCta } from '@/components/mock-site/sticky-cta';
import { CatalogProvider } from '@/lib/mock/catalog';
import { CATALOG_REVALIDATE, fetchCatalogServer } from '@/lib/mock/catalog-server';
import { publicPageMeta } from '@/lib/mock/seo';

export const revalidate = CATALOG_REVALIDATE;

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'landing.meta' });
  return publicPageMeta(lang, '', { title: t('title'), description: t('description'), absolute: true });
}

export default async function LandingPage({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  const t = await getTranslations('landing.phone');
  const catalog = await fetchCatalogServer();
  return (
    <PageShell ns={['landing']}>
      <CatalogProvider initial={catalog}>
        <SiteHeader />
        <AppBar left="logo" lang login flat />
        <main className="m-main m-with-cta-phone">
          <LandingDesktop />
          <LandingPhone />
        </main>
        <SiteFooter />
        <StickyCta primary={{ label: t('startFree'), href: `/${lang}/signup?next=free` }} secondary={{ label: t('sample'), href: `/${lang}/sample-result` }} />
      </CatalogProvider>
    </PageShell>
  );
}
