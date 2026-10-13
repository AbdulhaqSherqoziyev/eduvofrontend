/**
 * mock.eduvo.uz root layout — the second root layout next to src/app/(erp)/layout.tsx.
 * Served on the mock host as `/{lang}/…` (src/middleware.ts rewrites to `/m/{lang}/…`).
 * `<html lang dir>` comes from the [lang] segment (no headers()), so marketing pages stay static.
 */
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { LOCALES, dirOf, htmlLang, isLocale, type MockLocale } from '@/i18n/locales';
import { fontVarsFor } from '@/lib/mock/fonts';
import { MOCK_ORIGIN } from '@/lib/mock/seo';
import '../../mock.css';

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params: { lang } }: { params: { lang: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'common.meta' });
  return {
    metadataBase: new URL(MOCK_ORIGIN),
    title: { default: t('title'), template: `%s · Eduvo Mock` },
    description: t('description'),
    icons: { icon: '/favicon.svg' },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E8ECF3' },
    { media: '(prefers-color-scheme: dark)', color: '#1B2230' },
  ],
};

/** Theme before first paint: saved choice (guest: localStorage), else the OS preference. */
const THEME_SCRIPT =
  "try{var t=localStorage.getItem('eduvo_mock_theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}";

export default async function MockRootLayout({ children, params: { lang } }: { children: React.ReactNode; params: { lang: string } }) {
  const locale = (isLocale(lang) ? lang : 'en') as MockLocale;
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={htmlLang(locale)} dir={dirOf(locale)} className={fontVarsFor(locale)} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {/* only `common` goes to every client bundle; pages add their own namespaces where needed */}
        <NextIntlClientProvider locale={locale} messages={{ common: messages.common }}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
