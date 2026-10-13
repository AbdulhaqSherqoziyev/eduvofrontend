'use client';
/**
 * In-player "Log in to keep going" (design addendum §5.2): shown when a player request got 401 and
 * the refresh cookie could not renew the session. Not dismissable (no X / Esc / backdrop).
 * Answers stay in the player's device copy; after login the attempt re-boots and syncs them.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MockApiError, currentAccessToken, lastLearnerEmail } from '@/lib/mock/api/client';
import { login } from '@/lib/mock/api/endpoints';
import { setExamToken } from '@/lib/exam/api';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';
import { useToast } from '../toast';

export function SessionModal({ onBack }: { onBack: () => void }) {
  const t = useTranslations('player.session');
  const tc = useTranslations('common');
  const { href } = useLang();
  const toast = useToast();
  const known = lastLearnerEmail();
  const [email, setEmail] = useState(known ?? '');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ kind: 'field' | 'warn' | 'err'; text: string } | null>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  useEffect(() => { pwRef.current?.focus(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw) { setErr({ kind: 'field', text: t('emptyPw') }); return; }
    setBusy(true); setErr(null);
    try {
      const s = await login({ email: email.trim(), password: pw });
      if (known && s.learner.email && s.learner.email.toLowerCase() !== known.toLowerCase()) {
        setErr({ kind: 'field', text: t('otherAccount', { email: known }) });
        setBusy(false);
        return;
      }
      setExamToken(currentAccessToken());
      toast(t('back'));
      onBack();
    } catch (x) {
      setBusy(false);
      if (!(x instanceof MockApiError)) { setErr({ kind: 'warn', text: t('offline') }); return; }
      if (x.code === 'INVALID_CREDENTIALS') setErr({ kind: 'field', text: t('wrong') });
      else if (x.code === 'ACCOUNT_LOCKED') setErr({ kind: 'err', text: t('locked') });
      else if (x.code === 'RATE_LIMITED') setErr({ kind: 'warn', text: t('rate', { sec: x.retryAfterSec ?? 60 }) });
      else if (x.code === 'NETWORK' || x.status >= 500) setErr({ kind: 'warn', text: t('offline') });
      else setErr({ kind: 'warn', text: tc('errors.server') });
    }
  };

  return (
    <div className="m-modal-wrap" style={sx('position:absolute;background:rgba(15,20,30,.45)')}>
      <form className="m-modal" role="dialog" aria-modal="true" aria-label={t('title')} onSubmit={submit} noValidate lang={undefined}
        onKeyDown={(e) => { if (e.key === 'Escape') e.preventDefault(); }}>
        <span className="m-pill m-pill--warn" style={sx('align-self:flex-start')}>{t('chip')}</span>
        <h2 style={sx('margin:0;font-size:22px;font-weight:800')}>{t('title')}</h2>
        <p style={sx('margin:0;color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t('body')}</p>
        <label className="m-field">{t('email')}
          <input className="m-input" type="email" dir="ltr" value={email} readOnly={!!known} onChange={(e) => setEmail(e.target.value)} style={sx('text-align:start')} />
        </label>
        <label className="m-field">{t('password')}
          <input ref={pwRef} className="m-input" type="password" autoComplete="current-password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(null); }} aria-invalid={err?.kind === 'field'} />
          {err?.kind === 'field' && <span className="m-err-text" role="alert">{err.text}</span>}
        </label>
        {err?.kind === 'err' && <div className="m-banner m-banner--err" role="alert">{err.text} <a href={href('/help/contact')} target="_blank" rel="noopener">{t('contact')}</a></div>}
        {err?.kind === 'warn' && <div className="m-banner m-banner--warn m-banner--pulse" role="status" style={sx('align-items:center')}><span style={sx('flex:1')}>{err.text}</span></div>}
        <button type="submit" className="m-btn m-btn--primary" disabled={busy} style={sx('height:52px;font-size:16px')}>{busy && <span className="m-spin" aria-hidden />}{busy ? t('loggingIn') : t('login')}</button>
        <button type="button" className="m-btn m-btn--soft" aria-disabled="true" style={sx('height:50px;font-size:15px')} onClick={() => toast(tc('chips.soon'))}>{t('google')} <span className="m-soon">{tc('chips.soon')}</span></button>
        <a href={href('/forgot')} target="_blank" rel="noopener" style={sx('align-self:center;font-weight:700;font-size:14px')}>{t('forgot')}</a>
      </form>
    </div>
  );
}
