/**
 * Client-side i18n + toast context for one page. Only `common` + the listed namespaces are sent to
 * the browser (not all 40 locales' files, not other pages' copy).
 */
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { Namespace } from '@/i18n/namespaces';
import { ToastProvider } from './toast';

export async function PageShell({ ns = [], children }: { ns?: Namespace[]; children: React.ReactNode }) {
  const locale = await getLocale();
  const all = await getMessages();
  const messages: Record<string, unknown> = { common: all.common };
  for (const n of ns) messages[n] = all[n];
  return (
    <NextIntlClientProvider locale={locale} messages={messages as never}>
      <ToastProvider>{children}</ToastProvider>
    </NextIntlClientProvider>
  );
}
