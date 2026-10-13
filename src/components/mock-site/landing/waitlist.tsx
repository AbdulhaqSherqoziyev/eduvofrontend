'use client';
/**
 * "Coming soon" exam cards with Notify me (C2 /mock/waitlist). Desktop: inline email form → green
 * confirmation line. Phone rows: learners subscribe in one tap; guests enter the email in a sheet.
 */
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { joinWaitlist } from '@/lib/mock/api/endpoints';
import { MockApiError } from '@/lib/mock/api/client';
import type { WaitlistTopic } from '@/lib/mock/api/types';
import { useSession } from '@/lib/mock/hooks/use-session';
import { useTurnstile } from '@/lib/mock/hooks/use-turnstile';
import { sx } from '@/lib/mock/sx';
import { BottomSheet } from '../bottom-sheet';
import { useToast } from '../toast';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function useSubscribe() {
  const locale = useLocale();
  const tc = useTranslations('common.errors');
  return async (exam: WaitlistTopic, email: string | undefined, turnstile: string): Promise<string | null> => {
    try {
      await joinWaitlist({ exam, email, locale, turnstile: turnstile || undefined });
      return null;
    } catch (e) {
      if (e instanceof MockApiError && e.code === 'RATE_LIMITED') return tc('rateLimited', { sec: e.retryAfterSec ?? 60 });
      if (e instanceof MockApiError && e.code === 'NETWORK') return tc('network');
      if (e instanceof MockApiError && e.code === 'VALIDATION_FAILED') return 'invalid';
      return tc('server');
    }
  };
}

export function WaitlistForm({ exam }: { exam: WaitlistTopic }) {
  const t = useTranslations('landing.exams');
  const session = useSession();
  const learnerEmail = session.status === 'learner' ? session.learner.email ?? '' : '';
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const ts = useTurnstile(session.status !== 'learner');
  const subscribe = useSubscribe();
  const value = email || learnerEmail;

  if (done) {
    return (
      <div style={sx('height:44px;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--ok)')} role="status">
        <span style={sx('width:8px;height:8px;border-radius:50%;background:var(--ok);flex:none')} />{t('notified')}
      </div>
    );
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(value.trim())) { setErr(t('emailInvalid')); return; }
    setBusy(true); setErr('');
    const r = await subscribe(exam, value.trim(), ts.token);
    setBusy(false);
    if (r === null) setDone(true);
    else { setErr(r === 'invalid' ? t('emailInvalid') : r); ts.reset(); }
  };
  return (
    <form onSubmit={submit} noValidate style={sx('display:flex;flex-direction:column;gap:6px')}>
      <div style={sx('display:flex;gap:8px')}>
        <input type="email" required value={value} onChange={(e) => { setEmail(e.target.value); setErr(''); }} placeholder={t('emailPh')} aria-label={t('emailPh')}
          aria-invalid={!!err} className="m-input" autoComplete="email" dir="ltr"
          style={sx('flex:1;min-width:0;height:44px;border-radius:12px;box-shadow:var(--raise-sm);padding:0 14px;font-size:14px;text-align:start')} />
        <button type="submit" disabled={busy} className="m-btn m-btn--soft" style={sx('height:44px;padding:0 16px;border-radius:12px;color:var(--blue);font-weight:700;font-size:14px')}>
          {busy ? <span className="m-spin m-spin--ink" aria-hidden /> : t('notify')}
        </button>
      </div>
      {err && <span className="m-err-text" role="alert">{err}</span>}
      <div ref={ts.ref} />
    </form>
  );
}

export function WaitlistRows({ items }: { items: Array<{ exam: WaitlistTopic; name: string; color: string }> }) {
  const t = useTranslations('landing.phone');
  const te = useTranslations('landing.exams');
  const toast = useToast();
  const session = useSession();
  const subscribe = useSubscribe();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [sheet, setSheet] = useState<{ exam: WaitlistTopic; name: string } | null>(null);
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const ts = useTurnstile(!!sheet);

  const finish = (exam: WaitlistTopic, name: string) => { setDone((d) => ({ ...d, [exam]: true })); toast(t('notifyToast', { exam: name })); };
  const tap = async (exam: WaitlistTopic, name: string) => {
    if (done[exam]) return;
    if (session.status !== 'learner') { setSheet({ exam, name }); setErr(''); return; }
    const r = await subscribe(exam, undefined, '');
    if (r === null) finish(exam, name); else toast(r === 'invalid' ? te('emailInvalid') : r);
  };
  const submitSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheet) return;
    if (!EMAIL_RE.test(email.trim())) { setErr(te('emailInvalid')); return; }
    setBusy(true);
    const r = await subscribe(sheet.exam, email.trim(), ts.token);
    setBusy(false);
    if (r === null) { finish(sheet.exam, sheet.name); setSheet(null); } else { setErr(r === 'invalid' ? te('emailInvalid') : r); ts.reset(); }
  };

  return (
    <>
      <div className="m-rows m-rows--inset">
        {items.map((s) => {
          const d = !!done[s.exam];
          return (
            <div key={s.exam} style={sx('padding:14px 16px;display:flex;align-items:center;gap:12px')}>
              <span style={{ ...sx('width:10px;height:10px;border-radius:50%;flex:none'), background: s.color }} />
              <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}>
                <b style={sx('font-size:15px')}>{s.name}</b>
                <span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{d ? t('soonDone') : t('soonState')}</span>
              </span>
              <button type="button" onClick={() => void tap(s.exam, s.name)} aria-pressed={d}
                style={{ ...sx('height:36px;padding:0 14px;border-radius:12px;border:0;background:var(--bg);font-weight:800;font-size:13px;cursor:pointer;white-space:nowrap'), boxShadow: d ? 'var(--inset)' : 'var(--raise-sm)', color: d ? 'var(--ok)' : 'var(--blue)' }}>
                {d ? t('added') : t('notify')}
              </button>
            </div>
          );
        })}
      </div>
      <BottomSheet open={!!sheet} title={sheet?.name ?? ''} onClose={() => setSheet(null)}>
        <form onSubmit={submitSheet} noValidate style={sx('display:flex;flex-direction:column;gap:12px')}>
          <label className="m-field">{te('emailPh')}
            <input type="email" className="m-input" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} aria-invalid={!!err} dir="ltr" autoComplete="email" inputMode="email"
              placeholder="you@example.com" style={sx('height:54px;border-radius:16px;font-size:16px;text-align:start')} />
            {err && <span className="m-err-text" role="alert">{err}</span>}
          </label>
          <div ref={ts.ref} />
          <button type="submit" className="m-cta__btn" disabled={busy} style={sx('flex:none')}>{busy && <span className="m-spin" aria-hidden />}{t('notify')}</button>
        </form>
      </BottomSheet>
    </>
  );
}
