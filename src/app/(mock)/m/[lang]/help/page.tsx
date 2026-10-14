/** /help — README §12 Help center: searchable FAQ in four groups (static per locale). */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { HelpCenter } from '@/components/mock-site/help/help-center';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { publicPageMeta } from '@/lib/mock/seo';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'help.meta' });
  return publicPageMeta(lang, '/help', { title: t('title'), description: t('description') });
}

export default async function HelpPage({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  const t = await getTranslations('help');
  return (
    <PageShell ns={['help']}>
      <SiteHeader />
      <AppBar left="back" title={t('h1')} />
      <main className="m-main m-legal" style={{ maxWidth: 880 }}>
        <header className="m-legal__head">
          <h1 className="m-h1 m-legal__h1">{t('h1')}</h1>
          <p className="m-lead">{t('sub')}</p>
        </header>
        <HelpCenter />
      </main>
      <SiteFooter />
    </PageShell>
  );
}
