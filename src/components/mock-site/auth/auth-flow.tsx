'use client';
/**
 * Auth and onboarding — Auth.dc.html (≥520: logo bar, aside + form card) and Mobile App.dc.html
 * `auth` / `verify` / `onb` (<520: app bar + sticky CTA). One state for both trees.
 * API: contract §1 (A1–A9) and §2 (P1/P2). Validation runs on submit (README §4).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LOCALES, LOCALE_NAMES, htmlLang, isTranslated, type MockLocale } from '@/i18n/locales';
import { MockApiError, ensureSession } from '@/lib/mock/api/client';
import { forgotPassword, getMe, googleAuth, login, patchMe, resendVerification, resetPassword, signup, verifyEmail } from '@/lib/mock/api/endpoints';
import type { Learner, OpenExamSlug } from '@/lib/mock/api/types';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useSession } from '@/lib/mock/hooks/use-session';
import { useTurnstile } from '@/lib/mock/hooks/use-turnstile';
import { sx } from '@/lib/mock/sx';
import { AppBar } from '../app-bar';
import { LanguageSheet } from '../language-sheet';
import { Logo } from '../logo';
import { StickyCta } from '../sticky-cta';
import { useToast } from '../toast';
import { useGoogleSignIn } from './google';

export type AuthMode = 'signup' | 'login' | 'forgot' | 'verify' | 'reset' | 'onboarding';

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const TERMS_VERSION = '2026-10';
const IELTS_TARGETS = ['5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'];
const SAT_TARGETS = ['1200', '1300', '1350', '1400', '1450', '1500', '1550', '1600'];
const COUNTRIES = ['UZ', 'KZ', 'KG', 'TJ', 'TM', 'TR', 'other'] as const;
const FORM_ID = 'm-auth-form';

const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return undefined; } };
const apiLocale = (l: string) => (isTranslated(l) ? l : 'en');

/** `?next=` — `free` or a same-site path under the current locale; anything else is ignored. */
function readNext(lang: string): string | null {
  if (typeof window === 'undefined') return null;
  const n = new URLSearchParams(window.location.search).get('next');
  if (!n) return null;
  if (n === 'free') return 'free';
  if (n.startsWith(`/${lang}/`) && !n.startsWith('//') && !n.includes('\\')) return n;
  return null;
}

export function AuthFlow({ mode: initial }: { mode: AuthMode }) {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const { lang, href } = useLang();
  const session = useSession();
  const learner = session.status === 'learner' ? session.learner : null;

  const [mode, setMode] = useState<AuthMode | 'sent'>(initial);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState<React.ReactNode>(null);
  const [fieldErr, setFieldErr] = useState<{ email?: string; password?: string; password2?: string }>({});
  const [captchaNeeded, setCaptchaNeeded] = useState(false);
  const [resent, setResent] = useState(false);
  const [verifyNote, setVerifyNote] = useState('');
  const [tokenState, setTokenState] = useState<'idle' | 'checking' | 'done' | 'invalid' | 'expired'>('idle');
  // onboarding
  const [step, setStep] = useState(0);
  const [exam, setExam] = useState<OpenExamSlug>('ielts');
  const [target, setTarget] = useState('7.0');
  const [date, setDate] = useState('');
  const [noDate, setNoDate] = useState(false);
  const [country, setCountry] = useState<(typeof COUNTRIES)[number]>('UZ');
  const [uiLang, setUiLang] = useState<MockLocale>(lang);
  const [langSheet, setLangSheet] = useState(false);
  const [dateErr, setDateErr] = useState('');

  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';
  const isSignup = mode === 'signup';
  const isForm = isLogin || isForgot || isSignup;
  const ts = useTurnstile(isSignup || isForgot || (isLogin && captchaNeeded));
  const google = useGoogleSignIn();
  const token = useMemo(() => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('token')), []);

  const emailBad = !EMAIL_RE.test(email.trim());
  const pwBad = pw.length < 8;
  const emailErr = fieldErr.email ?? (tried && emailBad ? t('err.email') : undefined);
  const pwErr = fieldErr.password ?? (tried && !isForgot && (isLogin ? !pw : pwBad) ? (isLogin ? t('err.emptyPassword') : t('err.password')) : undefined);

  const shown = learner?.email || email;

  /* ---------- navigation after a session exists ---------- */
  const afterAuth = (l: Learner) => {
    const next = readNext(lang);
    if (!l.emailVerified) return router.push(href(`/verify${next ? `?next=${encodeURIComponent(next)}` : ''}`));
    if (!l.onboardingCompletedAt) return router.push(href(`/onboarding${next ? `?next=${encodeURIComponent(next)}` : ''}`));
    if (next === 'free') return router.push(href(`/start/${l.goal?.exam ?? 'ielts'}?mode=section`));
    router.push(next ?? href('/dashboard'));
  };

  /* ---------- error mapping (codes → copy, never the server message) ---------- */
  function apiError(e: unknown): React.ReactNode {
    if (!(e instanceof MockApiError)) return tc('errors.server');
    switch (e.code) {
      case 'NETWORK': return tc('errors.network');
      case 'RATE_LIMITED': return tc('errors.rateLimited', { sec: e.retryAfterSec ?? 60 });
      case 'MOCK_DISABLED': return tc('errors.disabled');
      case 'INVALID_CREDENTIALS': return t('err.wrong');
      case 'ACCOUNT_LOCKED': return t('err.locked');
      case 'PASSWORD_NOT_SET': return t('err.passwordNotSet');
      case 'DISPOSABLE_EMAIL': return t('err.disposable');
      case 'CAPTCHA_FAILED': case 'CAPTCHA_REQUIRED': return t('err.captcha');
      case 'TOKEN_INVALID': return t('err.tokenInvalid');
      case 'TOKEN_EXPIRED': return t('err.tokenExpired');
      case 'EMAIL_TAKEN': {
        const providers = Array.isArray(e.body.providers) ? (e.body.providers as string[]) : [];
        if (providers.includes('google') && !providers.includes('password')) return t('err.emailTakenGoogle');
        return t.rich('err.emailTaken', { login: (c) => <a href={href('/login')}>{c}</a> });
      }
      default: return tc('errors.server');
    }
  }
  function applyFields(e: unknown): boolean {
    if (!(e instanceof MockApiError) || e.code !== 'VALIDATION_FAILED') return false;
    const f: typeof fieldErr = {};
    for (const x of e.fields) {
      if (x.field === 'email') f.email = t('err.email');
      if (x.field === 'password' || x.field === 'newPassword') f.password = x.code === 'PASSWORD_TOO_WEAK' ? t('err.weak') : t('err.password');
      if (x.field === 'passwordConfirm') f.password2 = t('err.differ');
      if (x.code === 'PASSWORDS_DIFFER') f.password2 = t('err.differ');
    }
    setFieldErr(f);
    return true;
  }

  /* ---------- submit: signup / login / forgot ---------- */
  const submit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setFieldErr({}); setFormErr(null);
    if (emailBad || (!isForgot && (isLogin ? !pw : pwBad))) { setTried(true); return; }
    setBusy(true);
    try {
      if (isSignup) {
        const s = await signup({ email: email.trim(), password: pw, locale: apiLocale(lang), timezone: tz(), termsVersion: TERMS_VERSION, turnstile: ts.token });
        afterAuth(s.learner);
      } else if (isLogin) {
        const s = await login({ email: email.trim(), password: pw, turnstile: ts.token || undefined });
        afterAuth(s.learner);
      } else {
        await forgotPassword(email.trim(), ts.token);
        setMode('sent');
      }
    } catch (e) {
      if (e instanceof MockApiError && e.code === 'CAPTCHA_REQUIRED') setCaptchaNeeded(true);
      if (!applyFields(e)) setFormErr(apiError(e));
      ts.reset();
    } finally { setBusy(false); }
  };

  const onGoogle = async () => {
    if (!google.available) { toast(t('googleSoon')); return; }
    setFormErr(null);
    try {
      const idToken = await google.signIn();
      if (!idToken) return;
      setBusy(true);
      const s = await googleAuth({ idToken, locale: apiLocale(lang), timezone: tz(), termsVersion: TERMS_VERSION });
      afterAuth(s.learner);
    } catch (e) {
      setFormErr(e instanceof MockApiError && e.code === 'GOOGLE_NOT_CONFIGURED' ? t('googleSoon') : apiError(e));
    } finally { setBusy(false); }
  };

  /* ---------- verify ---------- */
  useEffect(() => {
    if (initial !== 'verify' || !token) return;
    setTokenState('checking');
    verifyEmail(token)
      .then(() => setTokenState('done'))
      .catch((e: unknown) => {
        if (e instanceof MockApiError && e.code === 'ALREADY_VERIFIED') setTokenState('done');
        else if (e instanceof MockApiError && e.code === 'TOKEN_EXPIRED') setTokenState('expired');
        else if (e instanceof MockApiError && e.code === 'TOKEN_INVALID') setTokenState('invalid');
        else { setTokenState('idle'); setFormErr(apiError(e)); }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, token]);

  const checkVerified = async () => {
    setVerifyNote(''); setBusy(true);
    try {
      const s = await ensureSession();
      if (s.status !== 'learner') { router.push(href(`/login${readNext(lang) ? `?next=${encodeURIComponent(readNext(lang)!)}` : ''}`)); return; }
      const me = await getMe();
      if (me.emailVerified) afterAuth(me); else setVerifyNote(t('verify.notYet'));
    } catch (e) { setVerifyNote(String(apiError(e))); } finally { setBusy(false); }
  };
  const resend = async () => {
    setVerifyNote('');
    const s = await ensureSession();
    if (s.status !== 'learner') { setVerifyNote(t('verify.needLogin')); return; }
    try { await resendVerification(); setResent(true); } catch (e) {
      if (e instanceof MockApiError && e.code === 'ALREADY_VERIFIED') { afterAuth(s.learner); return; }
      setVerifyNote(String(apiError(e)));
    }
  };

  /* ---------- reset ---------- */
  const submitReset = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setFieldErr({}); setFormErr(null);
    if (pw.length < 8) { setFieldErr({ password: t('err.password') }); return; }
    if (pw !== pw2) { setFieldErr({ password2: t('err.differ') }); return; }
    if (!token) { setFormErr(t('err.tokenInvalid')); return; }
    setBusy(true);
    try { const s = await resetPassword(token, pw, pw2); afterAuth(s.learner); } catch (e) { if (!applyFields(e)) setFormErr(apiError(e)); } finally { setBusy(false); }
  };

  /* ---------- onboarding ---------- */
  const onbChecked = useRef(false);
  useEffect(() => {
    if (initial !== 'onboarding' || onbChecked.current) return;
    onbChecked.current = true;
    void ensureSession().then((s) => {
      if (s.status !== 'learner') router.replace(href(`/login?next=${encodeURIComponent(href('/onboarding'))}`));
      else if (s.learner.goal) { setExam(s.learner.goal.exam); setTarget(s.learner.goal.exam === 'ielts' ? s.learner.goal.targetScore.toFixed(1) : String(s.learner.goal.targetScore)); }
    });
  }, [initial, href, router]);
  const pickExam = (e: OpenExamSlug) => { setExam(e); setTarget(e === 'ielts' ? '7.0' : '1450'); };
  const finish = async () => {
    setFormErr(null); setDateErr(''); setBusy(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (!noDate && date && date < today) { setStep(2); setDateErr(t('err.dateInPast')); return; }
      await patchMe({
        goal: { exam, targetScore: Number(target), examDate: noDate || !date ? null : date, noDateYet: noDate || !date },
        country: country === 'other' ? null : country,
        ...(isTranslated(uiLang) ? { locale: uiLang } : {}),
        timezone: tz(),
        completeOnboarding: true,
      });
      document.cookie = `NEXT_LOCALE=${uiLang};path=/;max-age=31536000;samesite=lax`;
      const next = readNext(lang);
      const dest = next && next !== 'free' ? next.replace(`/${lang}/`, `/${uiLang}/`) : `/${uiLang}/start/${exam}?mode=section`;
      if (uiLang !== lang) window.location.assign(dest); else router.push(dest);
    } catch (e) {
      if (e instanceof MockApiError && e.code === 'VALIDATION_FAILED' && e.fields.some((f) => f.code === 'DATE_IN_PAST')) { setStep(2); setDateErr(t('err.dateInPast')); }
      else setFormErr(apiError(e));
    } finally { setBusy(false); }
  };
  const skip = async () => {
    setBusy(true);
    try { await patchMe({ completeOnboarding: true }); router.push(href('/dashboard')); } catch (e) { setFormErr(apiError(e)); } finally { setBusy(false); }
  };
  const onbNext = () => { if (step < 3) setStep(step + 1); else void finish(); };

  /* ---------- texts ---------- */
  const copy = isLogin ? 'login' : isForgot ? 'forgot' : 'signup';
  const onbTitle = [t('onb.t0'), exam === 'ielts' ? t('onb.t1Ielts') : t('onb.t1Sat'), t('onb.t2'), t('onb.t3')][step];
  const onbTitlePhone = [t('onb.t0'), exam === 'ielts' ? t('onb.t1Ielts') : t('onb.t1SatPhone'), t('onb.t2'), t('onb.t3')][step];
  const targets = exam === 'ielts' ? IELTS_TARGETS : SAT_TARGETS;
  const emailNode = () => <bdi dir="ltr">{shown || t('verify.yourEmail')}</bdi>;

  const FormError = formErr ? <div className="m-banner m-banner--err" role="alert">{formErr}</div> : null;
  const googleBtn = (phone: boolean) => (
    <button type="button" onClick={onGoogle} aria-disabled={!google.available || undefined}
      className="m-btn m-btn--soft" style={sx(phone ? 'height:54px;border-radius:16px;font-weight:800;font-size:15px;width:100%' : 'height:50px;border-radius:14px;font-size:15px;width:100%')}>
      <span style={sx(`width:${phone ? 22 : 20}px;height:${phone ? 22 : 20}px;border-radius:50%;box-shadow:var(--inset);display:grid;place-items:center;font-size:12px;font-weight:800;color:var(--blue)`)}>G</span>
      {t('google')}
      {!google.available && <span className="m-soon">{tc('chips.soon')}</span>}
    </button>
  );
  const emailField = (phone: boolean) => (
    <label className="m-field">{t('email')}
      <input className="m-input" type="email" inputMode="email" autoComplete="email" dir="ltr" value={email} placeholder={t('emailPh')}
        onChange={(e) => { setEmail(e.target.value); setFieldErr((f) => ({ ...f, email: undefined })); }} aria-invalid={!!emailErr}
        style={sx(phone ? 'height:54px;border-radius:16px;font-size:16px;font-weight:600;text-align:start' : 'font-weight:500;text-align:start')} />
      {emailErr && <span className="m-err-text">{emailErr}</span>}
    </label>
  );
  const pwField = (phone: boolean) => (
    <label className="m-field">
      <span style={sx('display:flex;justify-content:space-between')}>{t('password')}{isLogin && !phone && <a href={href('/forgot')} style={sx('font-size:13px')}>{t('login.forgot')}</a>}</span>
      <input className="m-input" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} value={pw} placeholder={t('passwordPh')}
        onChange={(e) => { setPw(e.target.value); setFieldErr((f) => ({ ...f, password: undefined })); }} aria-invalid={!!pwErr}
        style={sx(phone ? 'height:54px;border-radius:16px;font-size:16px' : '')} />
      {pwErr && <span className="m-err-text">{pwErr}</span>}
    </label>
  );

  /* ================= desktop ================= */
  const desktopCard = (() => {
    if (isForm) return (
      <>
        <div style={sx('display:flex;flex-direction:column;gap:6px')}>
          <h2 style={sx('margin:0;font-size:26px;font-weight:800;letter-spacing:var(--ls-t)')}>{t(`${copy}.title`)}</h2>
          <span style={sx('color:var(--ink2);font-size:14px')}>{t(`${copy}.sub`)}</span>
        </div>
        {googleBtn(false)}
        <div style={sx('display:flex;align-items:center;gap:12px;color:var(--mut);font-size:12px;font-weight:700')}><span style={sx('flex:1;height:1px;background:var(--line)')} />{t('orEmail')}<span style={sx('flex:1;height:1px;background:var(--line)')} /></div>
        <form id={`${FORM_ID}-d`} onSubmit={submit} noValidate style={sx('display:flex;flex-direction:column;gap:16px')}>
          {emailField(false)}
          {!isForgot && pwField(false)}
          {FormError}
          <button type="submit" className="m-btn m-btn--primary" disabled={busy} style={sx('height:52px;font-weight:700;font-size:16px;width:100%')}>{busy && <span className="m-spin" aria-hidden />}{t(`${copy}.cta`)}</button>
        </form>
        <div style={sx('font-size:14px;color:var(--ink2);text-align:center')}>{t(`${copy}.switchText`)} <a href={href(isLogin ? '/signup' : '/login')} style={sx('font-weight:700')}>{t(`${copy}.switchLink`)}</a></div>
        {isSignup && <div style={sx('font-size:12px;color:var(--mut);text-align:center;line-height:1.5')}>{t.rich('signup.terms', { terms: (c) => <a href={href('/terms')}>{c}</a>, privacy: (c) => <a href={href('/privacy')}>{c}</a> })}</div>}
      </>
    );
    if (mode === 'verify' || mode === 'sent') {
      if (mode === 'verify' && token && tokenState !== 'idle') return (
        <>
          <div style={sx('width:64px;height:64px;border-radius:20px;box-shadow:var(--inset);display:grid;place-items:center;color:var(--blue);font-weight:800;font-size:22px')}>@</div>
          {tokenState === 'checking' && <div style={sx('display:flex;gap:10px;align-items:center;color:var(--ink2)')}><span className="m-spin m-spin--ink" />{t('verify.checking')}</div>}
          {tokenState === 'done' && <><h2 style={sx('margin:0;font-size:26px;font-weight:800')}>{t('verify.done')}</h2><button type="button" className="m-btn m-btn--primary" style={sx('height:52px;font-weight:700;font-size:16px')} onClick={checkVerified}>{t('verify.continue')}</button></>}
          {(tokenState === 'invalid' || tokenState === 'expired') && <><div className="m-banner m-banner--err" role="alert">{t(tokenState === 'expired' ? 'err.tokenExpired' : 'err.tokenInvalid')}</div><button type="button" className="m-btn m-btn--ghost" onClick={resend}>{resent ? t('verify.resent') : t('verify.resend')}</button>{verifyNote && <div className="m-banner m-banner--warn">{verifyNote}</div>}</>}
        </>
      );
      return (
        <>
          <div style={sx('width:64px;height:64px;border-radius:20px;box-shadow:var(--inset);display:grid;place-items:center;color:var(--blue);font-weight:800;font-size:22px')}>@</div>
          <div style={sx('display:flex;flex-direction:column;gap:8px')}>
            <h2 style={sx('margin:0;font-size:26px;font-weight:800')}>{mode === 'sent' ? t('sent.title') : t('verify.title')}</h2>
            <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t.rich(mode === 'sent' ? 'sent.body' : 'verify.body', { email: emailNode })}</span>
          </div>
          {mode === 'verify' && <button type="button" className="m-btn m-btn--primary" disabled={busy} onClick={checkVerified} style={sx('height:52px;font-weight:700;font-size:16px')}>{busy && <span className="m-spin" aria-hidden />}{t('verify.cta')}</button>}
          {verifyNote && <div className="m-banner m-banner--warn" role="status">{verifyNote}</div>}
          {FormError}
          {mode === 'verify'
            ? <button type="button" onClick={resend} style={sx('height:46px;border-radius:13px;border:0;background:transparent;color:var(--blue);font-weight:700;font-size:14px;cursor:pointer')}>{resent ? t('verify.resent') : t('verify.resend')}</button>
            : <a href={href('/login')} style={sx('height:46px;display:grid;place-items:center;font-weight:700;font-size:14px')}>{t('sent.back')}</a>}
        </>
      );
    }
    if (mode === 'reset') return (
      <form onSubmit={submitReset} noValidate style={sx('display:flex;flex-direction:column;gap:20px')}>
        <div style={sx('display:flex;flex-direction:column;gap:6px')}><h2 style={sx('margin:0;font-size:26px;font-weight:800')}>{t('reset.title')}</h2></div>
        <input className="m-input" type="password" autoComplete="new-password" placeholder={t('reset.new')} aria-label={t('reset.new')} value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!fieldErr.password} />
        {fieldErr.password && <span className="m-err-text" style={sx('margin-top:-12px')}>{fieldErr.password}</span>}
        <input className="m-input" type="password" autoComplete="new-password" placeholder={t('reset.repeat')} aria-label={t('reset.repeat')} value={pw2} onChange={(e) => setPw2(e.target.value)} aria-invalid={!!fieldErr.password2} />
        {fieldErr.password2 && <span className="m-err-text" style={sx('margin-top:-12px')}>{fieldErr.password2}</span>}
        {FormError}
        <button type="submit" className="m-btn m-btn--primary" disabled={busy} style={sx('height:52px;font-weight:700;font-size:16px')}>{busy && <span className="m-spin" aria-hidden />}{t('reset.cta')}</button>
      </form>
    );
    // onboarding
    return (
      <>
        <div style={sx('display:flex;gap:6px')}>
          {(['exam', 'target', 'date', 'country'] as const).map((k, i) => (
            <div key={k} style={sx('flex:1;display:flex;flex-direction:column;gap:6px')}>
              <div style={{ ...sx('height:6px;border-radius:99px;box-shadow:var(--inset)'), background: i <= step ? 'var(--grad)' : 'transparent' }} />
              <span style={{ ...sx('font-size:11px;font-weight:700'), color: i <= step ? 'var(--ink)' : 'var(--mut)' }}>{t(`onb.steps.${k}`)}</span>
            </div>
          ))}
        </div>
        <h2 style={sx('margin:0;font-size:24px;font-weight:800;letter-spacing:var(--ls-t)')}>{onbTitle}</h2>
        {step === 0 && (
          <>
            <div role="radiogroup" aria-label={onbTitle} style={sx('display:grid;grid-template-columns:1fr 1fr;gap:14px')}>
              {(['ielts', 'sat'] as const).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={exam === k} className="m-radiocard" onClick={() => pickExam(k)} style={sx('padding:18px;border-radius:16px;display:flex;flex-direction:column;gap:6px')}>
                  <span style={{ ...sx('font-size:12px;font-weight:800;letter-spacing:.05em'), color: `var(--${k})` }} lang="en">{k === 'ielts' ? 'IELTS ACADEMIC' : 'DIGITAL SAT'}</span>
                  <span style={sx('font-weight:800;font-size:17px')}>{k === 'ielts' ? 'IELTS' : 'SAT'}</span>
                  <span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t(k === 'ielts' ? 'onb.ieltsMeta' : 'onb.satMeta')}</span>
                </button>
              ))}
            </div>
            <div style={sx('font-size:13px;color:var(--mut)')}>{t('onb.soon')}</div>
          </>
        )}
        {step === 1 && (
          <div role="radiogroup" aria-label={onbTitle} style={sx('display:grid;grid-template-columns:repeat(4,1fr);gap:10px')}>
            {targets.map((v) => (
              <button key={v} type="button" role="radio" aria-checked={target === v} onClick={() => setTarget(v)}
                style={{ ...sx('height:52px;border-radius:14px;border:0;cursor:pointer;font-weight:800;font-size:16px'), background: target === v ? 'var(--grad)' : 'var(--bg)', color: target === v ? '#fff' : 'var(--ink)', boxShadow: target === v ? 'none' : 'var(--raise-sm)' }}><bdi dir="ltr">{v}</bdi></button>
            ))}
          </div>
        )}
        {step === 2 && (
          <>
            <input className="m-input" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => { setDate(e.target.value); setNoDate(false); setDateErr(''); }} aria-invalid={!!dateErr} aria-label={t('onb.t2')} style={sx('height:52px')} />
            {dateErr && <span className="m-err-text">{dateErr}</span>}
            <label style={sx('display:flex;gap:10px;align-items:center;font-size:14px;font-weight:600;color:var(--ink2);cursor:pointer')}>
              <input type="checkbox" checked={noDate} onChange={() => { setNoDate(!noDate); setDateErr(''); }} style={sx('width:18px;height:18px;accent-color:#2E6BE6')} />{t('onb.noDate')}
            </label>
          </>
        )}
        {step === 3 && (
          <>
            <label className="m-field">{t('onb.country')}
              <select className="m-input" value={country} onChange={(e) => setCountry(e.target.value as (typeof COUNTRIES)[number])} style={sx('height:52px')}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{t(`onb.countries.${c}`)}</option>)}
              </select>
            </label>
            <label className="m-field">{t('onb.lang')}
              <select className="m-input" value={uiLang} onChange={(e) => setUiLang(e.target.value as MockLocale)} style={sx('height:52px')}>
                {LOCALES.map((l) => <option key={l} value={l} lang={htmlLang(l)}>{LOCALE_NAMES[l]}</option>)}
              </select>
            </label>
            <div style={sx('font-size:13px;color:var(--mut)')}>{t('onb.examEnglish')}</div>
          </>
        )}
        {FormError}
        <div style={sx('display:flex;gap:12px;margin-top:4px')}>
          {step > 0 && <button type="button" className="m-btn m-btn--soft" onClick={() => setStep(step - 1)} style={sx('height:52px;padding:0 20px;font-size:15px')}>{t('onb.back')}</button>}
          <button type="button" className="m-btn m-btn--primary" disabled={busy} onClick={onbNext} style={sx('flex:1;height:52px;font-weight:700;font-size:16px')}>{busy && <span className="m-spin" aria-hidden />}{step === 3 ? t('onb.finish') : t('onb.continue')}</button>
        </div>
      </>
    );
  })();

  /* ================= phone ================= */
  const phone = (() => {
    if (isForm) return (
      <form id={FORM_ID} onSubmit={submit} noValidate style={sx('padding:8px 20px 24px;display:flex;flex-direction:column;gap:18px')}>
        <div style={sx('display:flex;flex-direction:column;gap:6px')}><h1 style={sx('margin:0;font-size:28px;font-weight:800;letter-spacing:var(--ls-t)')}>{t(`${copy}.title`)}</h1><span style={sx('color:var(--ink2);font-size:15px')}>{t(`${copy}.sub`)}</span></div>
        {!isForgot && googleBtn(true)}
        {!isForgot && <div style={sx('display:flex;align-items:center;gap:12px;color:var(--mut);font-size:12px;font-weight:700')}><span style={sx('flex:1;height:1px;background:var(--line)')} />{t('or')}<span style={sx('flex:1;height:1px;background:var(--line)')} /></div>}
        {emailField(true)}
        {!isForgot && pwField(true)}
        {isLogin && <a href={href('/forgot')} style={sx('align-self:flex-end;color:var(--blue);font-weight:800;font-size:14px;padding:4px 0')}>{t('login.forgot')}</a>}
        {FormError}
        <a href={href(isLogin ? '/signup' : '/login')} style={sx('color:var(--ink2);font-size:14px;padding:8px 0;text-align:center')}>{isLogin ? t('login.switchTextPhone') : t(`${copy}.switchText`)} <b style={sx('color:var(--blue)')}>{t(`${copy}.switchLink`)}</b></a>
        {isSignup && <span style={sx('font-size:12px;color:var(--mut);text-align:center;line-height:1.5')}>{t('signup.termsPhone')}</span>}
      </form>
    );
    if (mode === 'verify' || mode === 'sent') return (
      <div style={sx('padding:40px 24px;display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center')}>
        <span style={sx('width:84px;height:84px;border-radius:28px;box-shadow:var(--raise);display:grid;place-items:center;color:var(--blue);font-weight:800;font-size:30px')}>@</span>
        {mode === 'verify' && token && tokenState !== 'idle' ? (
          <>
            {tokenState === 'checking' && <span className="m-spin m-spin--ink" />}
            {tokenState === 'done' && <h1 style={sx('margin:8px 0 0;font-size:26px;font-weight:800')}>{t('verify.done')}</h1>}
            {(tokenState === 'invalid' || tokenState === 'expired') && <div className="m-banner m-banner--err" role="alert">{t(tokenState === 'expired' ? 'err.tokenExpired' : 'err.tokenInvalid')}</div>}
          </>
        ) : (
          <>
            <h1 style={sx('margin:8px 0 0;font-size:26px;font-weight:800')}>{mode === 'sent' ? t('sent.title') : t('verify.titlePhone')}</h1>
            <span style={sx('color:var(--ink2);font-size:15px;line-height:1.6')}>{t.rich(mode === 'sent' ? 'sent.body' : 'verify.bodyPhone', { email: emailNode })}</span>
          </>
        )}
        {verifyNote && <div className="m-banner m-banner--warn" role="status" style={sx('text-align:start')}>{verifyNote}</div>}
        {FormError}
        {mode === 'verify' && tokenState !== 'done' && tokenState !== 'checking' && <button type="button" onClick={resend} style={sx('border:0;background:transparent;color:var(--blue);font-weight:800;font-size:14px;cursor:pointer;padding:10px')}>{resent ? t('verify.resent') : t('verify.resend')}</button>}
      </div>
    );
    if (mode === 'reset') return (
      <form id={FORM_ID} onSubmit={submitReset} noValidate style={sx('padding:8px 20px 24px;display:flex;flex-direction:column;gap:18px')}>
        <h1 style={sx('margin:0;font-size:28px;font-weight:800;letter-spacing:var(--ls-t)')}>{t('reset.title')}</h1>
        <label className="m-field">{t('reset.new')}<input className="m-input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!fieldErr.password} style={sx('height:54px;border-radius:16px;font-size:16px')} />{fieldErr.password && <span className="m-err-text">{fieldErr.password}</span>}</label>
        <label className="m-field">{t('reset.repeat')}<input className="m-input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} aria-invalid={!!fieldErr.password2} style={sx('height:54px;border-radius:16px;font-size:16px')} />{fieldErr.password2 && <span className="m-err-text">{fieldErr.password2}</span>}</label>
        {FormError}
      </form>
    );
    return (
      <div style={sx('padding:4px 20px 24px;display:flex;flex-direction:column;gap:20px')}>
        <div style={sx('display:flex;gap:6px')}>{[0, 1, 2, 3].map((i) => <span key={i} style={{ ...sx('flex:1;height:6px;border-radius:99px;box-shadow:var(--inset)'), background: i <= step ? 'var(--grad)' : 'transparent' }} />)}</div>
        <div style={sx('display:flex;flex-direction:column;gap:6px')}><span style={sx('font-size:13px;font-weight:800;color:var(--mut)')}>{t('onb.stepOf', { n: step + 1 })}</span><h1 style={sx('margin:0;font-size:26px;font-weight:800;letter-spacing:var(--ls-t);line-height:1.2')}>{onbTitlePhone}</h1></div>
        {step === 0 && (
          <div role="radiogroup" aria-label={onbTitlePhone} style={sx('display:flex;flex-direction:column;gap:12px')}>
            {(['ielts', 'sat'] as const).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={exam === k} className="m-radiocard" onClick={() => pickExam(k)} style={sx('min-height:76px;border-radius:20px;padding:16px 18px;display:flex;align-items:center;gap:14px')}>
                <span className="m-radio" />
                <span style={sx('flex:1;display:flex;flex-direction:column;gap:3px')}><span style={{ ...sx('font-size:11px;font-weight:800;letter-spacing:.05em'), color: `var(--${k})` }} lang="en">{k === 'ielts' ? 'IELTS ACADEMIC' : 'DIGITAL SAT'}</span><b style={sx('font-size:17px')}>{k === 'ielts' ? 'IELTS' : 'SAT'}</b></span>
                <span style={sx('font-size:12px;color:var(--mut);font-weight:700')}>{t(k === 'ielts' ? 'onb.ieltsMeta' : 'onb.satMetaPhone')}</span>
              </button>
            ))}
            <span style={sx('font-size:13px;color:var(--mut)')}>{t('onb.soon')}</span>
          </div>
        )}
        {step === 1 && (
          <div role="radiogroup" aria-label={onbTitlePhone} style={sx('display:grid;grid-template-columns:repeat(4,1fr);gap:10px')}>
            {targets.map((v) => (
              <button key={v} type="button" role="radio" aria-checked={target === v} onClick={() => setTarget(v)}
                style={{ ...sx('height:56px;border-radius:16px;border:0;cursor:pointer;font-weight:800;font-size:16px'), background: target === v ? 'var(--grad)' : 'var(--bg)', color: target === v ? '#fff' : 'var(--ink)', boxShadow: target === v ? 'none' : 'var(--raise-sm)' }}><bdi dir="ltr">{v}</bdi></button>
            ))}
          </div>
        )}
        {step === 2 && (
          <>
            <input className="m-input" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => { setDate(e.target.value); setNoDate(false); setDateErr(''); }} aria-invalid={!!dateErr} aria-label={t('onb.t2')} style={sx('height:56px;border-radius:16px;font-size:16px')} />
            {dateErr && <span className="m-err-text">{dateErr}</span>}
            <button type="button" role="checkbox" aria-checked={noDate} onClick={() => { setNoDate(!noDate); setDateErr(''); }} className="m-btn m-btn--soft" style={sx('min-height:56px;height:auto;border-radius:16px;padding:0 16px;justify-content:flex-start;gap:12px;font-size:15px;text-align:start;white-space:normal')}>
              <span style={{ ...sx('width:24px;height:24px;border-radius:8px;box-shadow:var(--inset);display:grid;place-items:center;color:#fff;font-size:13px;font-weight:800;flex:none'), background: noDate ? 'var(--blue)' : 'transparent' }}>{noDate ? '✓' : ''}</span>{t('onb.noDatePhone')}
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <div className="m-rows">
              <label style={sx('display:flex;align-items:center;gap:12px;padding:0 16px;min-height:58px')}>
                <span style={sx('flex:1;font-weight:700;font-size:15px')}>{t('onb.country')}</span>
                <select value={country} onChange={(e) => setCountry(e.target.value as (typeof COUNTRIES)[number])} style={sx('border:0;background:transparent;color:var(--ink2);font-size:15px;font-weight:700;outline:none;text-align:end')}>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{t(`onb.countries.${c}`)}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => setLangSheet(true)} style={sx('width:100%;border:0;background:transparent;color:var(--ink);display:flex;align-items:center;gap:12px;padding:0 16px;min-height:58px;cursor:pointer;text-align:start')}>
                <span style={sx('flex:1;font-weight:700;font-size:15px')}>{t('onb.lang')}</span><span style={sx('color:var(--ink2);font-weight:700;font-size:15px')} lang={htmlLang(uiLang)}>{LOCALE_NAMES[uiLang]}</span>
              </button>
            </div>
            <span style={sx('font-size:13px;color:var(--mut)')}>{t('onb.examEnglish')}</span>
            <OnbLangSheet open={langSheet} onClose={() => setLangSheet(false)} value={uiLang} onPick={setUiLang} />
          </>
        )}
        {FormError}
      </div>
    );
  })();

  /* phone bars per Mobile App.dc.html `C` table */
  const phoneBar = mode === 'onboarding'
    ? <AppBar left={step > 0 ? 'back' : 'logo'} onBack={() => setStep(step - 1)} skip={{ onClick: () => void skip() }} />
    : mode === 'verify' ? <AppBar left="back" title={t('verify.bar')} backHref={href('/signup')} />
    : <AppBar left="back" backHref={href('')} />;
  const phoneCta = isForm
    ? { label: t(`${copy}.cta`), onClick: () => void submit(), busy }
    : mode === 'verify' ? (tokenState === 'done' ? { label: t('verify.continue'), onClick: () => void checkVerified(), busy } : { label: t('verify.ctaPhone'), onClick: () => void checkVerified(), busy })
    : mode === 'sent' ? { label: t('sent.back'), href: href('/login') }
    : mode === 'reset' ? { label: t('reset.cta'), onClick: () => void submitReset(), busy }
    : { label: step === 3 ? t('onb.finishPhone') : t('onb.continue'), onClick: onbNext, busy };

  return (
    <div style={sx('min-height:100vh;display:flex;flex-direction:column')}>
      <div className="m-desk" style={sx('max-width:1200px;width:100%;margin:0 auto;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px')}>
        <Logo href={href('')} label={tc('brand.home')} />
        {mode === 'onboarding' && <button type="button" onClick={() => void skip()} style={sx('border:0;background:transparent;color:var(--ink2);font-weight:700;font-size:14px;cursor:pointer;padding:10px')}>{t('onb.skip')}</button>}
      </div>
      {phoneBar}
      <main className="m-desk" style={sx('flex:1;max-width:1200px;width:100%;margin:0 auto;padding:clamp(12px,4vw,48px) 20px 48px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:48px;align-items:center')}>
        {mode !== 'onboarding' && (
          <div style={sx('display:flex;flex-direction:column;gap:22px;min-width:0')}>
            <h1 className="m-hyph" style={sx('margin:0;font-size:clamp(28px,3.4vw,44px);line-height:1.1;letter-spacing:var(--ls-h);font-weight:800;text-wrap:balance')}>{t('aside.h1')}</h1>
            <div style={sx('display:flex;flex-direction:column;gap:12px')}>
              {(['b1', 'b2', 'b3'] as const).map((b, i) => (
                <div key={b} style={sx('display:flex;gap:12px;align-items:center;font-size:15px;color:var(--ink2);font-weight:600')}>
                  <span style={sx('width:28px;height:28px;border-radius:9px;box-shadow:var(--inset);display:grid;place-items:center;color:var(--blue);font-weight:800;font-size:13px;flex:none')}>{i + 1}</span>{t(`aside.${b}`)}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="m-card" style={sx('width:100%;max-width:480px;justify-self:center;padding:clamp(24px,4vw,40px);display:flex;flex-direction:column;gap:20px')}>
          {desktopCard}
        </div>
      </main>
      <main className="m-phone m-with-cta-phone">{phone}</main>
      {/* one Turnstile slot for both layouts (it only becomes visible when Cloudflare needs an interaction) */}
      <div ref={ts.ref} className="m-ts" />
      <StickyCta primary={phoneCta} />
    </div>
  );
}

function OnbLangSheet({ open, onClose, value, onPick }: { open: boolean; onClose: () => void; value: MockLocale; onPick: (l: MockLocale) => void }) {
  // the onboarding picker stores the choice (applied on Finish); it does not reload the page like the app-bar sheet
  return <LanguageSheet open={open} onClose={onClose} current={value} onPick={(l) => { onPick(l); onClose(); }} />;
}
