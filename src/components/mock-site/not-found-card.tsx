/**
 * 404 state (README §13 System states): centered card with code, plain message and one primary action.
 * Server component — rendered by the catch-all page (the middleware sets the HTTP 404 status).
 */
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { sx } from '@/lib/mock/sx';

export async function NotFoundCard() {
  const t = await getTranslations('common.notFound');
  const lang = await getLocale();
  return (
    <main style={sx('min-height:70vh;display:grid;place-items:center;padding:40px 16px')}>
      <div className="m-card" style={sx('max-width:440px;width:100%;padding:32px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center')}>
        <span style={sx('font-size:56px;font-weight:800;letter-spacing:var(--ls-score-xl);line-height:1;color:var(--mut)')}><bdi dir="ltr">404</bdi></span>
        <h1 style={sx('margin:0;font-size:24px;font-weight:800')}>{t('title')}</h1>
        <p style={sx('margin:0;color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t('body')}</p>
        <Link className="m-btn m-btn--primary" href={`/${lang}`} style={sx('margin-top:6px')}>{t('home')}</Link>
      </div>
    </main>
  );
}
