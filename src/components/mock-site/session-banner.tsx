'use client';
/**
 * Shown while the session could not be restored for a technical reason (network down, 5xx, rate
 * limit after retries). The learner is not logged out: the page waits and "Try again" retries the
 * refresh. Uses the README reconnecting banner style (warnBg + pulsing dot).
 */
import { useTranslations } from 'next-intl';
import { retrySession } from '@/lib/mock/api/client';
import { useSession } from '@/lib/mock/hooks/use-session';

export function SessionBanner() {
  const t = useTranslations('common.errors');
  const s = useSession();
  if (s.status !== 'offline') return null;
  return (
    <div className="m-session-banner" role="status">
      <div className="m-banner m-banner--warn m-banner--pulse" style={{ alignItems: 'center' }}>
        <span style={{ flex: 1 }}>{t('network')}</span>
        <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => void retrySession()}>{t('tryAgain')}</button>
      </div>
    </div>
  );
}
