'use client';
/** README §12 contact form → U4 POST /mock/support/contact (name, email, topic, message, optional test ID). */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MockApiError } from '@/lib/mock/api/client';
import { contactSupport } from '@/lib/mock/api/endpoints';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useSession } from '@/lib/mock/hooks/use-session';
import { useTurnstile } from '@/lib/mock/hooks/use-turnstile';
import { sx } from '@/lib/mock/sx';

type Topic = 'exams' | 'payments' | 'account' | 'technical' | 'other';
const TOPICS: Topic[] = ['exams', 'payments', 'account', 'technical', 'other'];
const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function ContactForm() {
  const t = useTranslations('help.form');
  const tc = useTranslations('common');
  const { lang } = useLang();
  const s = useSession();
  const learner = s.status === 'learner' ? s.learner : null;
  const ts = useTurnstile(!learner);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<Topic>('exams');
  const [message, setMessage] = useState('');
  const [testCode, setTestCode] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const nameVal = name || learner?.displayName || '';
  const emailVal = learner?.email ?? email;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!nameVal.trim()) fe.name = t('errName');
    if (!learner && !EMAIL_RE.test(email.trim())) fe.email = t('errEmail');
    if (message.trim().length < 10) fe.message = t('errMessage');
    setErrs(fe); setFormErr('');
    if (Object.keys(fe).length) return;
    setBusy(true);
    try {
      const r = await contactSupport({
        name: nameVal.trim().slice(0, 80), ...(learner ? {} : { email: email.trim() }), topic, message: message.trim().slice(0, 4000),
        ...(testCode.trim() ? { testCode: testCode.trim().toUpperCase() } : {}), locale: lang, ...(ts.token ? { turnstile: ts.token } : {}),
      });
      setSent(r.ticketId);
    } catch (x) {
      const code = x instanceof MockApiError ? x.code : '';
      if (code === 'VALIDATION_FAILED' && x instanceof MockApiError) {
        const m: Record<string, string> = {};
        for (const f of x.fields) m[f.field] = f.field === 'email' ? t('errEmail') : f.field === 'message' ? t('errMessage') : f.field === 'name' ? t('errName') : t('errServer');
        setErrs(m);
      } else if (code === 'CAPTCHA_FAILED') { setFormErr(t('errCaptcha')); ts.reset(); }
      else if (code === 'RATE_LIMITED' && x instanceof MockApiError) setFormErr(tc('errors.rateLimited', { sec: x.retryAfterSec ?? 60 }));
      else if (code === 'NETWORK') setFormErr(tc('errors.network'));
      else setFormErr(t('errServer'));
    } finally { setBusy(false); }
  };

  if (sent) {
    return (
      <div className="m-card" role="status" style={sx('padding:24px;display:flex;flex-direction:column;gap:12px')}>
        <span className="m-pill m-pill--ok" style={sx('align-self:flex-start')}>✓</span>
        <b style={sx('font-size:18px')}>{t('sent')}</b>
        <span style={sx('color:var(--mut);font-size:13px;font-weight:700')}><bdi dir="ltr">{t('sentId', { id: sent.slice(0, 8).toUpperCase() })}</bdi></span>
        <button type="button" className="m-btn m-btn--soft" style={sx('align-self:flex-start')} onClick={() => { setSent(null); setMessage(''); setTestCode(''); }}>{t('another')}</button>
      </div>
    );
  }
  const err = (k: string) => errs[k] && <span className="m-err-text" role="alert">{errs[k]}</span>;
  return (
    <form className="m-card" onSubmit={(e) => void submit(e)} noValidate style={sx('padding:24px;display:flex;flex-direction:column;gap:14px')}>
      <b style={sx('font-size:18px')}>{t('title')}</b>
      <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:14px')}>
        <label className="m-field">{t('name')}<input className="m-input" value={nameVal} maxLength={80} autoComplete="name" onChange={(e) => setName(e.target.value)} aria-invalid={!!errs.name} />{err('name')}</label>
        <label className="m-field">{t('email')}<input className="m-input" type="email" dir="ltr" value={emailVal} readOnly={!!learner} maxLength={254} autoComplete="email" onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errs.email} />{err('email')}</label>
      </div>
      <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:14px')}>
        <label className="m-field">{t('topic')}
          <select className="m-input" value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>{TOPICS.map((k) => <option key={k} value={k}>{t(`topics.${k}`)}</option>)}</select>
        </label>
        <label className="m-field">{t('testId')}<input className="m-input" dir="ltr" value={testCode} maxLength={20} placeholder={t('testIdPh')} onChange={(e) => setTestCode(e.target.value)} /></label>
      </div>
      <label className="m-field">{t('message')}<textarea className="m-input" value={message} maxLength={4000} rows={6} placeholder={t('messagePh')} onChange={(e) => setMessage(e.target.value)} aria-invalid={!!errs.message} style={sx('height:auto;padding:14px 16px;resize:vertical;line-height:1.55')} />{err('message')}</label>
      <div ref={ts.ref} />
      {formErr && <div className="m-banner m-banner--err" role="alert">{formErr}</div>}
      <button type="submit" className="m-btn m-btn--primary" disabled={busy} style={sx('height:52px;font-weight:800;font-size:16px;align-self:flex-start;padding:0 28px')}>{busy && <span className="m-spin" aria-hidden />}{busy ? t('sending') : t('send')}</button>
    </form>
  );
}
