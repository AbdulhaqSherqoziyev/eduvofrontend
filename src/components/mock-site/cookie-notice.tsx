'use client';
/**
 * Cookie notice (README §12). The site sets only necessary cookies (session `mock_rt`, language
 * `NEXT_LOCALE`) and no analytics, so this is an information notice with one button, not a consent
 * dialog (Accept all / Only necessary / Settings would offer a choice that does not exist).
 * Not shown inside the exam player. Dismissal is kept in localStorage.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLang, usePathRest } from '@/lib/mock/hooks/use-lang';

const KEY = 'eduvo_mock_cookie_notice';

export function CookieNotice() {
  const t = useTranslations('common.cookieNotice');
  const { href } = useLang();
  const rest = usePathRest();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(localStorage.getItem(KEY) !== '1'); } catch { setShow(true); }
  }, []);
  if (!show || rest.startsWith('/exam/')) return null;
  const ok = () => {
    try { localStorage.setItem(KEY, '1'); } catch { /* private mode: hide for this page view */ }
    setShow(false);
  };
  return (
    <div className="m-cookie" role="region" aria-label={t('label')}>
      <p>{t('text')} <Link href={href('/cookies')} style={{ fontWeight: 700 }}>{t('more')}</Link></p>
      <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={ok}>{t('ok')}</button>
    </div>
  );
}
