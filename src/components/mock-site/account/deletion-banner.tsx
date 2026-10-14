'use client';
/** U3: while deletion is pending (14-day grace) the learner sees the date and can restore the account. */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { restoreAccount } from '@/lib/mock/api/endpoints';
import { fmtDateLong } from '@/lib/mock/format';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useSession } from '@/lib/mock/hooks/use-session';
import { sx } from '@/lib/mock/sx';
import { useToast } from '../toast';

export function DeletionBanner() {
  const t = useTranslations('account.account.pending');
  const { lang } = useLang();
  const toast = useToast();
  const s = useSession();
  const [busy, setBusy] = useState(false);
  if (s.status !== 'learner' || s.learner.status !== 'DELETION_PENDING') return null;
  const date = s.learner.deletionScheduledAt ? fmtDateLong(lang, s.learner.deletionScheduledAt) : '';
  const restore = async () => {
    setBusy(true);
    try { await restoreAccount(); toast(t('restored')); } catch { toast(t('err')); } finally { setBusy(false); }
  };
  return (
    <div className="m-banner m-banner--warn" role="status" style={sx('align-items:center;flex-wrap:wrap')}>
      <span style={sx('flex:1;min-width:200px')}>{t('body', { date })}</span>
      <button type="button" className="m-btn m-btn--soft m-btn--sm" disabled={busy} onClick={() => void restore()}>{busy && <span className="m-spin m-spin--ink" aria-hidden />}{t('restore')}</button>
    </div>
  );
}
