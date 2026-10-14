'use client';
/**
 * Exam start — Exam Start.dc.html (≥1024: choice + rules + system check + Start; 520–1023: the
 * "Open on a computer" card instead of the check) and Mobile App.dc.html `start` (<520).
 * S1 (GET /mock/start/:exam) decides the test, the charge and any block; nothing is reserved until
 * Start (S2). The system check is client-only (contract §6).
 */
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MockApiError, ensureSession } from '@/lib/mock/api/client';
import { createAttempt, emailStartLink, getCatalog, getCredits, getStart, resendVerification } from '@/lib/mock/api/endpoints';
import type { AttemptMode, Catalog, ExamCredits, OpenExamSlug, SectionKey, StartInfo } from '@/lib/mock/api/types';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useSession } from '@/lib/mock/hooks/use-session';
import { sx } from '@/lib/mock/sx';
import { AppBar } from '../app-bar';
import { Segmented } from '../segmented';
import { StickyCta } from '../sticky-cta';
import { useToast } from '../toast';

type CheckKey = 'audio' | 'headphones' | 'fullscreen' | 'internet';
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/** `[exam]` is `ielts` | `sat`, or a test code from a startUrl (`IA-0142`, `SAT-0087`). */
export function parseExamParam(p: string): { exam: OpenExamSlug; test?: string } | null {
  const v = decodeURIComponent(p);
  if (v === 'ielts' || v === 'sat') return { exam: v };
  if (/^IA-\d+$/i.test(v)) return { exam: 'ielts', test: v.toUpperCase() };
  if (/^SAT-\d+$/i.test(v)) return { exam: 'sat', test: v.toUpperCase() };
  return null;
}

export function StartView({ examParam }: { examParam: string }) {
  const t = useTranslations('start');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const { lang, href } = useLang();
  const parsed = useMemo(() => parseExamParam(examParam), [examParam]);
  const exam: OpenExamSlug = parsed?.exam ?? 'ielts';
  const ielts = exam === 'ielts';

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<AttemptMode>('full');
  const [section, setSection] = useState<SectionKey | null>(null);
  const [info, setInfo] = useState<StartInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [credits, setCredits] = useState<ExamCredits | null>(null);
  const [checks, setChecks] = useState<Record<CheckKey, 'todo' | 'ok' | 'bad' | 'busy'>>({ audio: 'todo', headphones: 'todo', fullscreen: 'todo', internet: 'busy' });
  const [fsDenied, setFsDenied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startErr, setStartErr] = useState('');
  const [emailed, setEmailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resent, setResent] = useState(false);
  const idem = useRef(uuid());
  const slow = useDelayedFlag(loading);

  /* guest → login; read ?mode/section */
  const session = useSession();
  useEffect(() => {
    void ensureSession().then((s) => {
      if (s.status === 'guest') { router.replace(href(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)); return; }
      if (s.status !== 'learner') return; // offline: the session banner retries, this effect runs again
      const q = new URLSearchParams(window.location.search);
      const m = q.get('mode') === 'section' ? 'section' : 'full';
      setMode(m);
      const sec = q.get('section') as SectionKey | null;
      if (sec) setSection(sec);
      setReady(true);
    });
  }, [href, router, session.status]);

  /* catalog (section facts, free eligibility) + credits (free still available) */
  useEffect(() => {
    if (!ready) return;
    getCatalog().then(setCatalog).catch(() => undefined);
    getCredits().then((r) => setCredits(r.credits.find((c) => c.exam === exam) ?? null)).catch(() => undefined);
  }, [ready, exam]);
  const catSections = useMemo(() => catalog?.exams.find((e) => e.slug === exam)?.sections ?? [], [catalog, exam]);

  /* section mode without a section: first free-eligible one while the free section is unused */
  useEffect(() => {
    if (!ready || mode !== 'section' || section || !catSections.length) return;
    const free = credits?.freeSectionAvailable ? catSections.find((s) => s.freeEligible) : undefined;
    setSection((free ?? catSections[0]).key);
  }, [ready, mode, section, catSections, credits]);

  const load = useCallback(() => {
    if (!ready || (mode === 'section' && !section)) return;
    const ac = new AbortController();
    setLoading(true); setLoadErr(false);
    getStart(exam, { mode, section: mode === 'section' ? section! : undefined, test: parsed?.test }, ac.signal)
      .then((r) => { setInfo(r); idem.current = uuid(); })
      .catch((e: unknown) => { if ((e as Error)?.name !== 'AbortError') setLoadErr(true); })
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return ac;
  }, [ready, mode, section, exam, parsed?.test]);
  useEffect(() => { const ac = load(); return () => ac?.abort(); }, [load]);

  /* internet check: GET /portal/exams/time (public) */
  const checkNet = useCallback(() => {
    setChecks((c) => ({ ...c, internet: 'busy' }));
    fetch(`${process.env.NEXT_PUBLIC_MOCK_API_BASE || '/api'}/portal/exams/time`, { cache: 'no-store' })
      .then((r) => setChecks((c) => ({ ...c, internet: r.ok ? 'ok' : 'bad' })))
      .catch(() => setChecks((c) => ({ ...c, internet: 'bad' })));
  }, []);
  useEffect(() => { checkNet(); }, [checkNet]);

  const playTone = () => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 440; g.gain.value = 0.15; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.8);
      o.onended = () => void ctx.close();
    } catch { /* no audio device: the learner still confirms they heard nothing below */ }
    setChecks((c) => ({ ...c, audio: 'ok' }));
  };
  const allowFs = async () => {
    setFsDenied(false);
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      setChecks((c) => ({ ...c, fullscreen: 'ok' }));
    } catch { setFsDenied(true); }
  };

  // audio checks only when Listening is part of the attempt (a Reading/Writing section has no audio); SAT: fullscreen + internet
  const hasListening = ielts && (mode === 'full' || section === 'listening');
  const required: CheckKey[] = (info?.systemCheck ?? ['audio', 'headphones', 'fullscreen', 'internet'])
    .filter((k) => hasListening || (k !== 'audio' && k !== 'headphones'));
  const allReady = required.every((k) => checks[k] === 'ok');
  const blocked = info?.blocked ?? null;
  const canStart = !!info && !blocked && !!info.charge && allReady && !starting;

  const start = async () => {
    if (!info || !canStart) return;
    setStarting(true); setStartErr('');
    try {
      const r = await createAttempt({ exam, mode, sectionKey: mode === 'section' ? section! : undefined, testId: info.test?.id, idempotencyKey: idem.current });
      router.push(href(`/exam/${r.attemptId}`));
    } catch (e) {
      setStarting(false);
      if (e instanceof MockApiError && (e.code === 'TEST_ALREADY_TAKEN' || e.code === 'NO_CREDIT' || e.code === 'NO_FRESH_TEST' || e.code === 'ACTIVE_ATTEMPT_EXISTS' || e.code === 'FREE_SECTION_USED')) { load(); return; }
      if (e instanceof MockApiError && e.code === 'ACCOUNT_DELETION_PENDING') { setStartErr(tc('errors.deletionPending')); return; }
      setStartErr(e instanceof MockApiError && e.code === 'NETWORK' ? tc('errors.network') : e instanceof MockApiError && e.code === 'RATE_LIMITED' ? tc('errors.rateLimited', { sec: e.retryAfterSec ?? 60 }) : tc('errors.server'));
    }
  };

  const [pageUrl, setPageUrl] = useState('');
  useEffect(() => { setPageUrl(window.location.href); }, []);
  const startUrl = info?.startUrl ?? pageUrl;
  const shortUrl = startUrl.replace(/^https?:\/\//, '');
  const emailLink = async () => {
    try { await emailStartLink({ exam, mode, sectionKey: mode === 'section' ? section ?? undefined : undefined, testCode: info?.test?.code }); setEmailed(true); toast(t('emailed')); }
    catch (e) { toast(e instanceof MockApiError && e.code === 'EMAIL_NOT_VERIFIED' ? t('blocked.EMAIL_NOT_VERIFIED') : tc('errors.server')); }
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(startUrl); } catch { /* the URL is shown below for manual copy */ }
    setCopied(true); toast(t('copied'));
  };

  /* ---------- rows ---------- */
  const fmtTime = (min: number, extra = 0) => (extra ? t('time.minCheck', { n: min, extra }) : t('time.min', { n: min }));
  const fmtTotal = (min: number) => (min >= 60 ? t('time.hm', { h: Math.floor(min / 60), m: min % 60 }) : t('time.min', { n: min }));
  const rows = (catSections.length ? catSections : info?.sections ?? []).map((cs) => {
    const fromInfo = info?.sections.find((x) => x.key === cs.key);
    const tag = mode === 'full' ? 'included' : fromInfo?.tag ?? ('freeEligible' in cs && cs.freeEligible && credits?.freeSectionAvailable ? 'free' : 'credit');
    return { key: cs.key, durationMin: cs.durationMin, extraMin: cs.extraMin, tag };
  });
  const selName = section ? t(`sec.${section}`) : '';
  const isFree = info?.charge?.source === 'free';
  const note = info?.charge
    ? info.charge.source === 'free' ? t('note.free', { exam: ielts ? 'IELTS' : 'SAT' })
      : info.charge.source === 'unlimited' ? t('note.unlimited')
      : t(`note.${info.charge.source}`, { n: info.charge.remainingAfter + 1 })
    : '';

  const blockedBox = blocked && (
    <div className="m-banner m-banner--warn" role="status" style={sx('align-items:center;flex-wrap:wrap')}>
      <span style={sx('flex:1;min-width:200px')}>{t(`blocked.${blocked.reason === 'DESKTOP_REQUIRED' ? 'COMING_SOON' : blocked.reason}`, { exam: ielts ? 'IELTS' : 'SAT' })}</span>
      {blocked.reason === 'EMAIL_NOT_VERIFIED' && <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => { void resendVerification().then(() => setResent(true)).catch(() => setResent(true)); }}>{resent ? t('resent') : t('blockedAct.EMAIL_NOT_VERIFIED')}</button>}
      {blocked.reason === 'NO_CREDIT' && <Link className="m-btn m-btn--soft m-btn--sm" href={href(`/pricing?exam=${exam}`)}>{t('blockedAct.NO_CREDIT')}</Link>}
      {blocked.reason === 'ACTIVE_ATTEMPT_EXISTS' && blocked.attemptId && <Link className="m-btn m-btn--soft m-btn--sm" href={href(`/exam/${blocked.attemptId}`)}>{t('blockedAct.ACTIVE_ATTEMPT_EXISTS')}</Link>}
    </div>
  );
  const errBox = loadErr && (
    <div className="m-banner m-banner--err" role="alert" style={sx('align-items:center')}>
      <span style={sx('flex:1')}>{t('loadError')}</span><button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => load()}>{t('retry')}</button>
    </div>
  );
  const skel = (w: string, h = 18) => <span className="m-skel" style={{ display: 'block', width: w, height: h }} />;

  const checkRows: Array<{ k: CheckKey; name: string; note: string; act?: string; run?: () => void }> = [
    ...(required.includes('audio') ? [{ k: 'audio' as const, name: t('audio'), note: checks.audio === 'ok' ? t('audioOk') : t('audioTodo'), act: checks.audio === 'ok' ? undefined : t('audioAct'), run: playTone }] : []),
    ...(required.includes('headphones') ? [{ k: 'headphones' as const, name: t('head'), note: checks.headphones === 'ok' ? t('headOk') : t('headTodo'), act: checks.headphones === 'ok' ? undefined : t('headAct'), run: () => setChecks((c) => ({ ...c, headphones: 'ok' })) }] : []),
    { k: 'fullscreen', name: t('fs'), note: checks.fullscreen === 'ok' ? t('fsOk') : fsDenied ? t('fsDenied') : t('fsTodo'), act: checks.fullscreen === 'ok' ? undefined : t('fsAct'), run: () => void allowFs() },
    { k: 'internet', name: t('net'), note: checks.internet === 'ok' ? t('netOk') : checks.internet === 'busy' ? t('netChecking') : t('netBad'), act: checks.internet === 'bad' ? t('netAct') : undefined, run: checkNet },
  ];

  const computerCard = (
    <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:16px')}>
      <div style={sx('width:56px;height:40px;border-radius:8px;border:3px solid var(--ink2);border-bottom-width:8px')} aria-hidden />
      <div style={sx('font-weight:800;font-size:20px')}>{t('computer')}</div>
      <div style={sx('color:var(--ink2);font-size:14px;line-height:var(--lh-body)')}>{t('computerBody')}</div>
      <button type="button" className="m-btn m-btn--primary" onClick={() => void emailLink()} style={sx('height:52px;font-weight:700;font-size:16px')}>{emailed ? t('emailed') : t('emailLink')}</button>
      <button type="button" className="m-btn m-btn--soft" onClick={() => void copyLink()} style={sx('height:50px;font-size:15px')}>{copied ? t('copied') : t('copyLink')}</button>
      <div dir="ltr" style={sx('padding:12px 14px;border-radius:12px;box-shadow:var(--inset);font-size:13px;color:var(--ink2);font-weight:600;word-break:break-all;text-align:start')}>{shortUrl}</div>
    </div>
  );

  return (
    <>
      <AppBar left="back" title={isFree ? t('barTitle') : mode === 'full' ? t('barTitleFull') : t('barTitleSection')} backHref={href('/dashboard')} />
      {/* ================= ≥520 ================= */}
      <main className="m-desk" style={sx('max-width:1120px;margin:0 auto;padding:clamp(24px,4vw,48px) 20px 64px;display:flex;flex-direction:column;gap:28px')}>
        <div style={sx('display:flex;flex-direction:column;gap:10px')}>
          <div style={sx('display:flex;gap:8px;flex-wrap:wrap;align-items:center')}>
            <span className="m-eyebrow" style={{ ...sx('font-size:13px;letter-spacing:.05em'), color: `var(--${exam})` }} lang="en">{ielts ? 'IELTS ACADEMIC' : 'DIGITAL SAT'}</span>
            {isFree && <span className="m-pill m-pill--ok" style={sx('font-weight:700')}>{t('freeSection')}</span>}
          </div>
          <h1 className="m-h1" style={sx('font-size:clamp(28px,3.4vw,40px);letter-spacing:var(--ls-h)')}>{t('h1')}</h1>
          <div style={sx('display:flex;gap:6px 16px;flex-wrap:wrap;font-size:14px;color:var(--ink2);font-weight:600;min-height:21px')}>
            {info?.test ? <><span>{t.rich('test', { code: () => <bdi dir="ltr">{info.test!.code}</bdi> })}</span><span>{t('newToYou')}</span></> : loading && slow ? skel('320px', 16) : null}
          </div>
        </div>
        {errBox}
        {blockedBox}
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:24px;align-items:start')}>
          <div style={sx('display:flex;flex-direction:column;gap:24px;min-width:0')}>
            <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:16px')}>
              <div style={sx('font-weight:800;font-size:17px')}>{t('what')}</div>
              <Segmented grid label={t('what')} value={mode} onChange={(m) => setMode(m)} style={sx('gap:6px;padding:6px;border-radius:16px')}
                items={[{ key: 'full', label: t('kind.full') }, { key: 'section', label: t('kind.section') }]} btnStyle={sx('height:44px;border-radius:12px;font-size:14px')} />
              <div role={mode === 'section' ? 'radiogroup' : undefined} style={sx('display:flex;flex-direction:column;gap:10px')}>
                {!rows.length && slow && [0, 1, 2].map((i) => <div key={i} className="m-skel" style={sx('height:64px;border-radius:16px')} />)}
                {rows.map((r) => {
                  const on = mode === 'full' || section === r.key;
                  const off = mode === 'section' && r.tag === 'unavailable';
                  return (
                    <button key={r.key} type="button" role={mode === 'section' ? 'radio' : undefined} aria-checked={mode === 'section' ? section === r.key : undefined} disabled={off}
                      onClick={() => { if (mode === 'section' && !off) setSection(r.key); }}
                      style={{ ...sx('text-align:start;padding:14px 16px;border-radius:16px;border:0;background:var(--bg);color:var(--ink);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;outline-offset:-2px'),
                        cursor: mode === 'full' ? 'default' : off ? 'not-allowed' : 'pointer', boxShadow: on ? 'var(--inset)' : 'var(--raise-sm)', outline: mode === 'section' && section === r.key ? '2px solid var(--blue)' : '0', opacity: off ? 0.55 : 1 }}>
                      <span style={sx('font-weight:800;font-size:15px')}>{t(`sec.${r.key}`)}</span>
                      <span style={sx('font-weight:800;font-size:15px')}><bdi dir="ltr">{fmtTime(r.durationMin, r.extraMin)}</bdi></span>
                      <span style={sx('font-size:13px;color:var(--mut);font-weight:600')}>{t(`meta2.${r.key}`)}</span>
                      <span style={sx('font-size:12px;color:var(--mut);font-weight:700;text-align:end')}>{t(`tag.${r.tag}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:14px')}>
              <div style={sx('font-weight:800;font-size:17px')}>{t('rules')}</div>
              {[ielts ? t('ruleIelts1') : t('ruleSat1'), ielts ? t('ruleIelts2') : t('ruleSat2'), t('rule3'), t('rule4'), t('rule5')].map((r, i) => (
                <div key={i} style={sx('display:flex;gap:12px;font-size:14px;line-height:1.55;color:var(--ink2)')}><span style={sx('width:6px;height:6px;border-radius:50%;background:var(--blue);margin-top:8px;flex:none')} /><span>{r}</span></div>
              ))}
            </div>
          </div>

          <div style={sx('display:flex;flex-direction:column;gap:24px;min-width:0')}>
            <div className="m-only-xl" style={sx('display:flex;flex-direction:column;gap:24px')}>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:14px')}>
                <div style={sx('font-weight:800;font-size:17px')}>{t('check')}</div>
                {checkRows.map((c) => (
                  <div key={c.k} style={sx('display:flex;gap:14px;align-items:center;padding:14px 16px;border-radius:16px;box-shadow:var(--inset)')}>
                    <span style={{ ...sx('width:10px;height:10px;border-radius:50%;flex:none'), background: checks[c.k] === 'ok' ? 'var(--ok)' : 'var(--warn)' }} />
                    <div style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}><span style={sx('font-weight:700;font-size:14px')}>{c.name}</span><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{c.note}</span></div>
                    {c.act && <button type="button" onClick={c.run} style={sx('height:38px;padding:0 14px;border-radius:11px;border:0;background:var(--bg);box-shadow:var(--raise-sm);color:var(--blue);font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap')}>{c.act}</button>}
                  </div>
                ))}
              </div>
              <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:14px')}>
                <div style={sx('display:flex;justify-content:space-between;gap:12px;font-size:14px;color:var(--ink2);font-weight:600')}>
                  <span>{mode === 'full' ? t('summaryFull', { n: rows.length }) : t('summarySection', { name: selName })}</span>
                  <span style={sx('color:var(--ink);font-weight:800')}><bdi dir="ltr">{info ? fmtTotal(mode === 'full' ? catalog?.exams.find((e) => e.slug === exam)?.facts?.totalDurationMin ?? info.totalDurationMin : info.totalDurationMin) : ''}</bdi></span>
                </div>
                <button type="button" onClick={() => void start()} disabled={!canStart} aria-disabled={!canStart}
                  style={{ ...sx('height:56px;border-radius:14px;border:0;color:#fff;font-weight:800;font-size:17px;display:flex;align-items:center;justify-content:center;gap:8px'), background: canStart ? 'var(--grad)' : 'var(--mut)', boxShadow: canStart ? 'var(--glow)' : 'none', cursor: canStart ? 'pointer' : 'not-allowed' }}>
                  {starting && <span className="m-spin" aria-hidden />}{starting ? t('starting') : allReady ? t('start', { kind: mode }) : t('finishCheck')}
                </button>
                <span style={sx('font-size:12px;color:var(--mut);text-align:center;min-height:15px')}>{note}</span>
                {startErr && <div className="m-banner m-banner--err" role="alert">{startErr}</div>}
              </div>
            </div>
            <div className="m-below-xl">{computerCard}</div>
          </div>
        </div>
      </main>

      {/* ================= <520 ================= */}
      <main className="m-phone m-with-cta-phone" style={sx('padding:8px 16px 24px;display:flex;flex-direction:column;gap:18px')}>
        {errBox}
        {blockedBox}
        <div className="m-card" style={sx('padding:18px;display:flex;flex-direction:column;gap:14px')}>
          <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
            <span className="m-eyebrow" style={{ ...sx('letter-spacing:.05em'), color: `var(--${exam})` }} lang="en">{ielts ? 'IELTS ACADEMIC' : 'DIGITAL SAT'}</span>
            {isFree && <span className="m-pill m-pill--ok" style={sx('padding:3px 9px;font-size:11px')}>{t('freeSection')}</span>}
          </div>
          <div role="radiogroup" style={sx('display:flex;flex-direction:column;gap:8px')}>
            {rows.map((r) => {
              const off = mode === 'section' && r.tag === 'unavailable';
              const on = mode === 'full' || section === r.key;
              return (
                <button key={r.key} type="button" role="radio" aria-checked={on} aria-disabled={off || undefined} className="m-radiocard"
                  onClick={() => { if (!off) { setMode('section'); setSection(r.key); } }} style={{ ...sx('min-height:60px;border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:12px'), opacity: off ? 0.55 : 1 }}>
                  <span className="m-radio" style={sx('width:20px;height:20px')} />
                  <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px')}><b style={sx('font-size:15px')}>{t(`sec.${r.key}`)}</b><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t(`metaPhone.${r.key}`)}</span></span>
                  <b style={sx('font-size:13px')}><bdi dir="ltr">{fmtTime(r.durationMin + r.extraMin)}</bdi></b>
                </button>
              );
            })}
          </div>
        </div>
        <div style={sx('border-radius:24px;box-shadow:var(--inset);padding:22px 18px;display:flex;flex-direction:column;gap:12px;align-items:center;text-align:center')}>
          <div style={sx('display:flex;flex-direction:column;align-items:center')} aria-hidden><span style={sx('width:96px;height:62px;border-radius:8px;border:4px solid var(--ink2)')} /><span style={sx('width:124px;height:8px;border-radius:0 0 8px 8px;background:var(--ink2)')} /></div>
          <b style={sx('font-size:19px;margin-top:6px')}>{t('computer')}</b>
          <span style={sx('font-size:14px;color:var(--ink2);line-height:1.55')}>{t('computerBodyPhone')}</span>
          <span dir="ltr" style={sx('padding:10px 12px;border-radius:12px;background:var(--bg);box-shadow:var(--raise-sm);font-size:13px;font-weight:700;color:var(--ink2);word-break:break-all')}>{shortUrl}</span>
        </div>
      </main>
      <StickyCta secondary={{ label: copied ? t('copied') : t('copyLink'), onClick: () => void copyLink() }} primary={{ label: emailed ? t('emailed') : t('emailLink'), onClick: () => void emailLink() }} />
    </>
  );
}
