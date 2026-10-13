/** /{lang}/checkout/orders/{id} — order status (manual pending / success / failed). Private. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { OrderView } from '@/components/mock-site/checkout/order-view';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteHeader } from '@/components/mock-site/site-header';
import { NOINDEX } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'checkout.meta' });
  return { title: t('order'), ...NOINDEX };
}

export default function OrderPage({ params: { lang, orderId } }: { params: { lang: MockLocale; orderId: string } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['checkout']}>
      <SiteHeader active="pricing" />
      <OrderView orderId={orderId} />
    </PageShell>
  );
}
