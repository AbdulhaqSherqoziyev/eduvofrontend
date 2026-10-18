'use client';
/**
 * Admin Login.dc.html: password step (wrong → "Yana N ta urinish qoldi", locked), 2FA step
 * (6-digit code: autofocus, paste, "Kod muddati o'tgan" / "Kod noto'g'ri"), plus the 2FA
 * enrollment step (not in the design — Sarvar: login-card style, minimal: QR + secret + code).
 * Talks to the backend only through `handlers`.
 */
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import type { AdminLoginHandlers, EnrollData } from './types';

type Step = 'password' | 'code' | 'enroll';
const NET_ERR = "Tarmoq xatosi. Qayta urinib ko'ring.";

export function LoginBrand() {
  return (
    <div className="ma-login-brand">
      <div className="ma-logo" aria-hidden="true">E</div>
      <span className="ma-brand-name">Eduvo Mock</span>
      <span className="ma-brand-tag">Admin</span>
    </div>
  );
}

export function LoginFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="ma-login">
      <div className="ma-login-col">
        <LoginBrand />
        <div className="ma-login-card">{children}</div>
        <span className="ma-login-foot">admin-mock.eduvo.uz · barcha harakatlar audit jurnaliga yoziladi</span>
      </div>
    </div>
  );
}

function CodeBoxes({ code, setCode, err, inputRef, onDirty }: {
  code: string; setCode: (v: string) => void; err: boolean; inputRef: React.RefObject<HTMLInputElement>; onDirty: () => void;
}) {
  return (
    <div className="ma-otp" onClick={() => inputRef.current?.focus()}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} aria-hidden="true" className={`ma-otp-box${err ? ' is-err' : i === code.length ? ' is-cur' : ''}`}>{code[i] ?? ''}</div>
      ))}
      <input
        ref={inputRef}
        value={code}
        onFocus={(e) => { if (err) e.currentTarget.select(); }}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 6);
          setCode(v);
          if (v.length) onDirty();
        }}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        aria-label="6 xonali kod"
        aria-invalid={err || undefined}
        aria-describedby={err ? 'ma-code-err' : undefined}
      />
    </div>
  );
}

export function AdminLoginScreen({ handlers }: { handlers: AdminLoginHandlers }) {
  const [step, setStep] = useState<Step>('password');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [triesLeft, setTriesLeft] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState<'expired' | 'invalid' | null>(null);
  const [enroll, setEnroll] = useState<EnrollData | null>(null);
  const [enrollErr, setEnrollErr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const codeInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'password') emailInput.current?.focus();
    else codeInput.current?.focus();
  }, [step, enroll]);

  async function loadEnroll() {
    setEnroll(null);
    setEnrollErr(false);
    try {
      setEnroll(await handlers.startEnroll());
    } catch {
      setEnrollErr(true);
    }
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    if (locked || busy || !email.trim() || !pw) return;
    setBusy(true);
    setFormErr(null);
    setTriesLeft(null);
    try {
      const r = await handlers.submitPassword(email.trim(), pw);
      if (r.kind === 'code' || r.kind === 'enroll') {
        setCode('');
        setCodeErr(null);
        setStep(r.kind);
        if (r.kind === 'enroll') void loadEnroll();
      } else if (r.kind === 'wrong') { setTriesLeft(r.triesLeft); setPw(''); }
      else if (r.kind === 'locked') { setLocked(true); setPw(''); }
      else setFormErr(r.text);
    } catch {
      setFormErr(NET_ERR);
    } finally {
      setBusy(false);
    }
  }

  async function onCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy || code.length !== 6) return;
    setBusy(true);
    setFormErr(null);
    try {
      const r = await handlers.submitCode(code);
      if (r.kind === 'ok') return handlers.done();
      if (r.kind === 'expired' || r.kind === 'invalid') { setCodeErr(r.kind); codeInput.current?.select(); }
      else if (r.kind === 'locked') { back(); setLocked(true); }
      else if (r.kind === 'restart') { back(); setFormErr(r.text); }
      else setFormErr(r.text);
    } catch {
      setFormErr(NET_ERR);
    } finally {
      setBusy(false);
    }
  }

  function back() {
    setStep('password');
    setPw('');
    setCode('');
    setCodeErr(null);
    setFormErr(null);
    setEnroll(null);
  }

  const wrong = triesLeft !== null && !locked;
  const codeErrText = codeErr === 'expired' ? "Kod muddati o'tgan. Ilovadagi yangi kodni kiriting." : codeErr === 'invalid' ? "Kod noto'g'ri. Qaytadan kiriting." : null;

  return (
    <LoginFrame>
      {step === 'password' && (
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
            <input ref={emailInput} className="ma-input s-48" type="email" inputMode="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required />
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
              maxLength={200}
              aria-invalid={wrong || undefined}
              aria-describedby={wrong ? 'ma-pw-err' : undefined}
              required
            />
            {wrong && <span id="ma-pw-err" className="ma-field-error" role="alert">Email yoki parol noto&apos;g&apos;ri. Yana {triesLeft} ta urinish qoldi.</span>}
          </label>
          {formErr && <span className="ma-field-error" role="alert">{formErr}</span>}
          <Button type="submit" size={50} disabled={locked} loading={busy} className={locked ? 'ma-login-btn-locked' : undefined}>Davom etish</Button>
        </form>
      )}

      {step === 'code' && (
        <form className="ma-login-step" onSubmit={onCode} noValidate>
          <div className="ma-login-head">
            <h1>2 bosqichli tasdiq</h1>
            <span>Authenticator ilovasidagi 6 xonali kodni kiriting.</span>
          </div>
          <CodeBoxes code={code} setCode={setCode} err={!!codeErr} inputRef={codeInput} onDirty={() => setCodeErr(null)} />
          {codeErrText && <span id="ma-code-err" className="ma-field-error" role="alert">{codeErrText}</span>}
          {formErr && <span className="ma-field-error" role="alert">{formErr}</span>}
          <Button type="submit" size={50} loading={busy}>Tasdiqlash</Button>
          <button type="button" className="ma-login-back" onClick={back}>← Boshqa hisob bilan kirish</button>
        </form>
      )}

      {step === 'enroll' && (
        <form className="ma-login-step" onSubmit={onCode} noValidate>
          <div className="ma-login-head">
            <h1>2 bosqichli tasdiqni ulash</h1>
            <span>Authenticator ilovasida QR kodni skanerlang yoki kalitni qo&apos;lda kiriting, so&apos;ng ilovadagi 6 xonali kodni yozing.</span>
          </div>
          <div className="ma-enroll">
            {enroll ? (
              <>
                {/* backend-made SVG shown as an image: no markup of it reaches the DOM */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="ma-enroll-qr" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(enroll.qrSvg)}`} alt="2FA QR kodi" width={184} height={184} />
                <div className="ma-enroll-secret">
                  <span className="ma-label">Kalit</span>
                  <code>{enroll.secret.replace(/(.{4})/g, '$1 ').trim()}</code>
                  <button
                    type="button"
                    className="ma-btn v-text s-32"
                    onClick={() => {
                      navigator.clipboard?.writeText(enroll.secret).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }, () => undefined);
                    }}
                  >
                    {copied ? 'Nusxa olindi' : 'Nusxa olish'}
                  </button>
                </div>
              </>
            ) : enrollErr ? (
              <div className="ma-state-inline" role="alert">
                <b>QR kodni yuklab bo&apos;lmadi</b>
                <span><button type="button" className="ma-btn v-text s-32" onClick={loadEnroll}>Qayta urinish</button></span>
              </div>
            ) : (
              <span className="ma-skel" style={{ width: 184, height: 184, borderRadius: 16, margin: '0 auto' }} aria-label="Yuklanmoqda" />
            )}
          </div>
          <CodeBoxes code={code} setCode={setCode} err={!!codeErr} inputRef={codeInput} onDirty={() => setCodeErr(null)} />
          {codeErrText && <span id="ma-code-err" className="ma-field-error" role="alert">{codeErrText}</span>}
          {formErr && <span className="ma-field-error" role="alert">{formErr}</span>}
          <Button type="submit" size={50} loading={busy} disabled={!enroll}>Tasdiqlash</Button>
          <button type="button" className="ma-login-back" onClick={back}>← Boshqa hisob bilan kirish</button>
        </form>
      )}
    </LoginFrame>
  );
}
