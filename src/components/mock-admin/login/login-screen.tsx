'use client';
/**
 * Admin Login.dc.html: password step (wrong → "Yana N ta urinish qoldi", locked), 2FA step
 * (6-digit code: autofocus, paste, "Kod muddati o'tgan"). Talks to the backend only through
 * `handlers` (AdminLoginHandlers) so the API wiring stays outside the UI.
 */
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import type { AdminLoginHandlers } from './types';

type Step = 'password' | 'code';
const NET_ERR = "Tarmoq xatosi. Qayta urinib ko'ring.";

/** Only same-site paths are followed after login (no open redirect). */
const safeNext = (v: string | null) => (v && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : '/');

export function AdminLoginScreen({ handlers }: { handlers: AdminLoginHandlers }) {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>('password');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [triesLeft, setTriesLeft] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState<'expired' | 'invalid' | null>(null);
  const [netErr, setNetErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const codeInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'code') codeInput.current?.focus();
    else emailInput.current?.focus();
  }, [step]);

  const done = () => router.replace(safeNext(params.get('next')));

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    if (locked || busy || !email.trim() || !pw) return;
    setBusy(true);
    setNetErr(false);
    setTriesLeft(null);
    try {
      const r = await handlers.submitPassword(email.trim(), pw);
      if (r.kind === 'ok') return done();
      if (r.kind === 'code') { setTriesLeft(null); setCode(''); setCodeErr(null); setStep('code'); }
      else if (r.kind === 'wrong') { setTriesLeft(r.triesLeft); setPw(''); }
      else { setLocked(true); setTriesLeft(null); setPw(''); }
    } catch {
      setNetErr(true);
    } finally {
      setBusy(false);
    }
  }

  async function onCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy || code.length !== 6) return;
    setBusy(true);
    setNetErr(false);
    try {
      const r = await handlers.submitCode(code);
      if (r.kind === 'ok') return done();
      if (r.kind === 'expired' || r.kind === 'invalid') { setCodeErr(r.kind); codeInput.current?.select(); }
      else if (r.kind === 'locked') { setLocked(true); back(); }
      else back();
    } catch {
      setNetErr(true);
    } finally {
      setBusy(false);
    }
  }

  function back() {
    setStep('password');
    setPw('');
    setCode('');
    setCodeErr(null);
    setNetErr(false);
  }

  const wrong = triesLeft !== null && !locked;

  return (
    <div className="ma-login">
      <div className="ma-login-col">
        <div className="ma-login-brand">
          <div className="ma-logo" aria-hidden="true">E</div>
          <span className="ma-brand-name">Eduvo Mock</span>
          <span className="ma-brand-tag">Admin</span>
        </div>
        <div className="ma-login-card">
          {step === 'password' ? (
            <form className="ma-login-step" onSubmit={onPassword} noValidate>
              <div className="ma-login-head">
                <h1>Kirish</h1>
                <span>Faqat taklif qilingan adminlar uchun.</span>
              </div>
              {locked && (
                <div className="ma-login-locked" role="alert">
                  <b>Hisob vaqtincha bloklandi</b>5 marta noto&apos;g&apos;ri parol kiritildi. 15 daqiqadan so&apos;ng qayta urinib ko&apos;ring yoki Owner&apos;ga murojaat qiling.
                </div>
              )}
              <label className="ma-field">
                <span className="ma-label">Email</span>
                <input
                  ref={emailInput}
                  className="ma-input s-48"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="ma-field">
                <span className="ma-label">Parol</span>
                <input
                  className={`ma-input s-48${wrong ? ' is-error' : ''}`}
                  type="password"
                  autoComplete="current-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  disabled={locked}
                  aria-invalid={wrong || undefined}
                  aria-describedby={wrong ? 'ma-pw-err' : undefined}
                  required
                />
                {wrong && (
                  <span id="ma-pw-err" className="ma-field-error" role="alert">
                    Email yoki parol noto&apos;g&apos;ri. Yana {triesLeft} ta urinish qoldi.
                  </span>
                )}
              </label>
              {netErr && <span className="ma-field-error" role="alert">{NET_ERR}</span>}
              <Button type="submit" size={50} disabled={locked} loading={busy} className={locked ? 'ma-login-btn-locked' : undefined}>
                Davom etish
              </Button>
            </form>
          ) : (
            <form className="ma-login-step" onSubmit={onCode} noValidate>
              <div className="ma-login-head">
                <h1>2 bosqichli tasdiq</h1>
                <span>Authenticator ilovasidagi 6 xonali kodni kiriting.</span>
              </div>
              <div className="ma-otp" onClick={() => codeInput.current?.focus()}>
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={`ma-otp-box${codeErr ? ' is-err' : i === code.length ? ' is-cur' : ''}`}
                  >
                    {code[i] ?? ''}
                  </div>
                ))}
                <input
                  ref={codeInput}
                  value={code}
                  onFocus={(e) => { if (codeErr) e.currentTarget.select(); }}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(v);
                    if (v.length) setCodeErr(null);
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  aria-label="6 xonali kod"
                  aria-invalid={!!codeErr || undefined}
                  aria-describedby={codeErr === 'expired' ? 'ma-code-err' : undefined}
                />
              </div>
              {codeErr === 'expired' && (
                <span id="ma-code-err" className="ma-field-error" role="alert">Kod muddati o&apos;tgan. Ilovadagi yangi kodni kiriting.</span>
              )}
              {netErr && <span className="ma-field-error" role="alert">{NET_ERR}</span>}
              <Button type="submit" size={50} loading={busy}>Tasdiqlash</Button>
              <button type="button" className="ma-login-back" onClick={back}>← Boshqa hisob bilan kirish</button>
            </form>
          )}
        </div>
        <span className="ma-login-foot">admin-mock.eduvo.uz · barcha harakatlar audit jurnaliga yoziladi</span>
      </div>
    </div>
  );
}
