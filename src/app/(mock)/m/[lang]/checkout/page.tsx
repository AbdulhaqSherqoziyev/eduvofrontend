/** /{lang}/checkout?sku=&cur= — Checkout.dc.html form / Mobile App `checkout`. Private. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { CheckoutForm } from '@/components/mock-site/checkout/checkout-form';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteHeader } from '@/components/mock-site/site-header';
import { NOINDEX } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'checkout.meta' });
  return { title: t('title'), ...NOINDEX };
}

export default function CheckoutPage({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['checkout']}>
      <SiteHeader active="pricing" />
      <CheckoutForm />
    </PageShell>
  );
}
