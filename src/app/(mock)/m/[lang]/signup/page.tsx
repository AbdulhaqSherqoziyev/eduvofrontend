/** /signup — signup (Auth.dc.html / Mobile App.dc.html). Private: noindex. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AuthFlow } from '@/components/mock-site/auth/auth-flow';
import { PageShell } from '@/components/mock-site/page-shell';
import { NOINDEX } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'auth.meta' });
  return { title: t('signup'), ...NOINDEX };
}

export default function Page({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['auth']}>
      <AuthFlow mode="signup" />
    </PageShell>
  );
}
