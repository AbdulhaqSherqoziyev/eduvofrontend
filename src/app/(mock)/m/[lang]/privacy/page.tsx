/** /privacy — README §12 long-form policy page (static per locale). */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { LegalPage, legalMetadata } from '@/components/mock-site/legal/legal-page';

export function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  return legalMetadata(lang, 'privacy');
}

export default function Page({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  return <LegalPage doc="privacy" lang={lang} />;
}
