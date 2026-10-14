/** /help/contact — README §12 contact form (U4) plus the direct channels: email and Telegram. */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { ContactChannels } from '@/components/mock-site/help/contact-channels';
import { ContactForm } from '@/components/mock-site/help/contact-form';
import { RichLine } from '@/components/mock-site/legal/rich-line';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { SUPPORT_TELEGRAM } from '@/lib/mock/legal';
import { publicPageMeta } from '@/lib/mock/seo';
import { sx } from '@/lib/mock/sx';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'help.meta' });
  return publicPageMeta(lang, '/help/contact', { title: t('contactTitle'), description: t('contactDescription') });
}

export default async function ContactPage({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  const t = await getTranslations('help.contact');
  const include = t.raw('include') as string[];
  return (
    <PageShell ns={['help']}>
      <SiteHeader />
      <AppBar left="back" backHref={`/${lang}/help`} title={t('h1')} />
      <main className="m-main m-legal" style={{ maxWidth: 880 }}>
        <header className="m-legal__head">
          <h1 className="m-h1 m-legal__h1">{t('h1')}</h1>
          <p className="m-lead">{SUPPORT_TELEGRAM ? t('sub') : t('subEmailOnly')}</p>
        </header>
        <div style={sx('display:flex;flex-direction:column;gap:24px')}>
          <ContactForm />
          <ContactChannels />
          <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:12px')}>
            <b style={sx('font-size:16px')}>{t('includeTitle')}</b>
            <ul style={sx('margin:0;padding-inline-start:22px;display:flex;flex-direction:column;gap:6px;color:var(--ink2);font-size:15px;line-height:1.6')}>
              {include.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <p style={sx('margin:0;font-size:14px;line-height:1.6;color:var(--mut)')}><RichLine text={t('paddle')} lang={lang} /></p>
        </div>
      </main>
      <SiteFooter />
    </PageShell>
  );
}
