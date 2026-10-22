'use client';
/**
 * Objective results (design A15/G10, Sevara T30–T37). Outside the player theme
 * (Eduvo brand). Dark card: overall band / SAT total from `estimatedOverall` (§1.10,
 * 2026-10-12) with "… bo'yicha"; "Xulosa" (per-type lines + next steps) under the cards.
 * No "estimated" wording anywhere (Abdulhaq 10-12).
 * While `status` is PARTIAL the page re-reads the result every 15 s (contract §1.10).
 * `isPreview` (staff, 2.11 token): no "My results" / portal links — the result
 * lives only on this page; the back button closes the preview tab (opened by
 * window.open from the console) or falls back to /exams/catalog.
 */
import { useCallback, useEffect, useState } from 'react';
import { examApi } from '@/lib/exam/api';
import type { ExamFamily } from '@/lib/exam/hub-types';
import { t, type Locale, type TextKey } from '@/lib/exam/i18n';
import type { ResultResp, ResultSection } from '@/lib/exam/types';
import { buildSummary } from '@/lib/exam/result-summary';
import { AiTaskPanel } from './AiTaskPanel';
import { SpeakingResultPanel } from './speaking/SpeakingResultPanel';
import { useForgetSpeakingDevice } from '@/lib/exam/speaking/use-forget';
import { resultPollMs } from '@/lib/exam/speaking/poll';
import { OverallBlock } from './OverallBlock';
import { ResultSummary } from './ResultSummary';
import { PassageModal } from './PassageModal';
import { ReviewList } from './ReviewList';

const POLL_MS = 15_000;
const CONSOLE_URL = '/exams/catalog';
const isAiSection = (key: string) => key === 'writing' || key === 'speaking';

function sub(sec: ResultSection, locale: Locale, family: string, spStatus?: string): string {
  if (sec.key === 'speaking' && spStatus === 'pending') return t('results.speaking_not_taken', locale);
  if (sec.status === 'GRADING' || sec.status === 'PENDING') return t('results.ws_in_progress', locale);
  if (sec.status === 'NEEDS_HUMAN') return t('results.human_review', locale);
  if (sec.status === 'NOT_TAKEN') return '—';
  if (family === 'CEFR' && sec.scaled != null) return sec.nextLevel ? t('results.cefr_to_next', locale, { n: sec.scaled, k: sec.nextLevel.min - sec.scaled, level: sec.nextLevel.level }) : t('results.cefr_score', locale, { n: sec.scaled });
  return sec.raw != null ? t('results.lr_raw', locale, { n: sec.raw, total: sec.max ?? 0 }) : '';
}

/** Preview tab was opened by the console with window.open → close it; otherwise go to the console. */
function backToConsole() {
  try { window.close(); } catch { /* not script-opened */ }
  window.setTimeout(() => { if (!window.closed) window.location.href = CONSOLE_URL; }, 250);
}

const btn = (primary: boolean) => ({ height: 42, borderRadius: 12, background: primary ? '#2E6BE6' : '#fff', color: primary ? '#fff' : '#1E2A3A', fontSize: 14, fontWeight: 700, padding: '0 18px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none', border: 'none', cursor: 'pointer' } as const);

export function ResultsView({ attemptId, locale, isPreview = false }: { attemptId: string; locale: Locale; isPreview?: boolean }) {
  const [r, setR] = useState<ResultResp | null>(null);
  const [err, setErr] = useState<TextKey | null>(null);
  const [sel, setSel] = useState(0);
  const [anchor, setAnchor] = useState<string | null>(null);
  const load = useCallback(async () => {
    const res = await examApi.result(attemptId);
    if (res.ok) { setR(res.data); setErr(null); return; }
    if (res.kind === 'network') setErr('banner.offline');
    else if (res.kind === 'auth') setErr(isPreview ? 'x.preview_expired' : 'x.sign_in');
    else if (res.code === 'ATTEMPT_NOT_FINISHED') setErr('x.result_not_finished');
    else setErr('errors.server');
  }, [attemptId, isPreview]);
  useEffect(() => { void load(); }, [load]);
  // Writing/Speaking are graded after the attempt closes: poll while PARTIAL (also after a transient error, so a dropped poll does not freeze the page).
  const pollMs = resultPollMs(r, POLL_MS); // slow while Speaking is only waiting to be taken later
  useEffect(() => { if (!pollMs) return; const iv = window.setInterval(() => void load(), pollMs); return () => window.clearInterval(iv); }, [pollMs, load]);

  useForgetSpeakingDevice(attemptId, r?.speaking);
  if (!r) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#7A8699', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <span>{err ? t(err, locale) : t('x.loading_result', locale)}</span>
        {err && <button type="button" onClick={() => void load()} style={btn(true)}>{t('chrome.retry', locale)}</button>}
        {err && isPreview && <button type="button" onClick={backToConsole} style={btn(false)}>{t('x.back_to_console', locale)}</button>}
      </div>
    );
  }
  const family: ExamFamily = r.examCode.startsWith('CEFR') ? 'CEFR' : r.examCode.startsWith('SAT') ? 'SAT' : r.examCode.startsWith('TOEFL') ? 'TOEFL' : r.examCode.startsWith('HSK') ? 'HSK' : 'IELTS';
  // Speaking stays visible while it is pending / not scored (speaking contract §4: `speaking` block decides)
  const sections = r.sections.filter((s) => s.status !== 'NOT_TAKEN' || (s.key === 'speaking' && !!r.speaking));
  const det = sections[Math.min(sel, sections.length - 1)];
  // SAT `no` restarts per module: with `stageKey` (contract v1.4) rows read "M1·4" (rowNo); only an old result without it is numbered by position
  const sat = family === 'SAT';
  const objective = r.review.filter((x) => x.sectionKey === det?.key).map((x, i) => (sat && !x.stageKey ? { ...x, no: i + 1 } : x));
  const grading = sections.some((s) => s.status === 'GRADING' || s.status === 'PENDING');
  const taken = sections.map((s) => s.title).join(', ');
  const card = { background: '#fff', borderRadius: 18 } as const;
  const summary = buildSummary(r);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 32px 56px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@media (max-width: 720px){.xr-pad{padding:20px 16px 40px !important}.xr-head{flex-direction:column;align-items:stretch !important}.xr-top{grid-template-columns:1fr !important}.xr-strip{flex-wrap:wrap}.xr-actions a,.xr-actions button{flex:1;justify-content:center}.xr-sum{padding:18px 16px !important}.xr-rev{grid-template-columns:1fr !important}}`}</style>
      <div className="xr-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7A8699', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>{r.examName ?? r.examCode} · {t(r.mode === 'section' ? 'x.single_section' : 'x.full_mock', locale)}</span>
            {isPreview && <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, borderRadius: 6, padding: '3px 7px', color: '#9A5B00', background: '#FFF1D6' }}>{t('x.preview_result_badge', locale).toUpperCase()}</span>}
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.7, marginTop: 6 }}>{t('x.your_results', locale)}</div>
        </div>
        <div className="xr-actions" style={{ display: 'flex', gap: 10 }}>
          {isPreview ? (
            <button type="button" onClick={backToConsole} style={btn(true)}>{t('x.back_to_console', locale)}</button>
          ) : (
            <>
              <a href="/portal" style={btn(false)}>{t('chrome.take_another_mock', locale)}</a>
              <a href="/portal" style={btn(true)}>{t('chrome.back_to_eduvo', locale)}</a>
            </>
          )}
        </div>
      </div>
      {sections.length === 0 ? (
        <div style={{ ...card, padding: '32px 24px', textAlign: 'center', color: '#4A586C', fontWeight: 600, fontSize: 14 }}>{t('x.result_empty', locale)}</div>
      ) : (
        <div className="xr-top" style={{ display: 'grid', gridTemplateColumns: '300px minmax(0,1fr)', gap: 16 }}>
          <div style={{ background: '#1E2A3A', color: '#fff', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, minHeight: 180 }}>
            <OverallBlock r={r} locale={locale} fallbackTitle={`${r.examName ?? r.examCode} — ${taken}`} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            {sections.map((s, i) => {
              const ai = isAiSection(s.key);
              return (
                <button key={s.key} type="button" onClick={() => setSel(i)} aria-pressed={i === sel} style={{ ...card, textAlign: 'left', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, border: `2px solid ${i === sel ? '#2E6BE6' : 'transparent'}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#4A586C' }}>{s.title}</span>
                  <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: '#1E2A3A', display: 'flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
                    {s.label ?? (s.status === 'NOT_TAKEN' ? '—' : '…')}{ai && <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, borderRadius: 6, padding: '3px 7px', color: '#5B3FD1', background: '#EEE9FF' }}>{t('x.ai_badge', locale)}</span>}
                  </span>
                  <span style={{ fontSize: 12, color: '#7A8699', fontWeight: 600 }}>{sub(s, locale, family, r.speaking?.status)}{s.level ? ` · ${s.level}` : ''}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {grading && (
        <div className="xr-strip" style={{ ...card, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }} role="status" aria-live="polite">
          <span style={{ fontSize: 14, fontWeight: 800 }}>{t(sections.some((x) => x.key === 'writing' && x.status === 'GRADING') ? 'results.grading_writing' : 'results.grading_speaking', locale)}</span>
          <span style={{ flex: 1, fontSize: 13, color: '#7A8699' }}>{isPreview ? `${t('x.preview_result_note', locale)} ${t('x.auto_refresh', locale)}` : t('results.can_leave', locale)}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#5B3FD1', background: '#EEE9FF', borderRadius: 8, padding: '4px 10px' }}>{t('results.strip_received', locale)}</span>
        </div>
      )}
      {isPreview && !grading && sections.length > 0 && <div style={{ fontSize: 13, color: '#7A8699', fontWeight: 600 }}>{t('x.preview_result_note', locale)}</div>}
      {r.certificate && <div style={{ fontSize: 13, color: '#7A8699' }}>{t('results.cefr_cert_note', locale, { min: r.certificate.min })}</div>}
      {summary.sections.length > 0 || summary.nextSteps.length > 0 ? (
        <div className="xr-sum" style={{ ...card, padding: '24px 26px' }}><ResultSummary data={summary} locale={locale} /></div>
      ) : null}
      {det && (
        <div style={{ ...card, padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {det.key !== 'speaking' || !r.speaking ? <div style={{ fontSize: 18, fontWeight: 800 }}>{det.title}</div> : null}
            {det.status === 'READY' && !isAiSection(det.key) && <span style={{ fontSize: 12, fontWeight: 700, color: '#7A8699', maxWidth: 620, textAlign: 'right' }}>{t('x.auto_how', locale)}</span>}
          </div>
          {det.key === 'speaking' && r.speaking ? (
            <SpeakingResultPanel sp={r.speaking} skin="flat" mode="preview" tx={(k, v) => t(k, locale, v)} onRefresh={() => void load()} />
          ) : isAiSection(det.key) ? (
            <AiTaskPanel r={r} family={family} locale={locale} />
          ) : det.status === 'GRADING' || det.status === 'PENDING' ? (
            <div style={{ fontSize: 14, color: '#7A8699', fontWeight: 600, padding: '20px 0' }}>{t('results.grading_writing', locale)} {t('results.others_ready', locale)}</div>
          ) : det.status === 'NEEDS_HUMAN' ? (
            <div style={{ fontSize: 14, color: '#7A8699', fontWeight: 600, padding: '20px 0' }}>{t('results.human_review', locale)}</div>
          ) : objective.length ? (
            <ReviewList rows={objective} locale={locale} onPassage={setAnchor} />
          ) : (
            <div style={{ fontSize: 14, color: '#7A8699' }}>{t(isPreview ? 'x.result_empty' : 'x.review_later', locale)}</div>
          )}
        </div>
      )}
      <div style={{ fontSize: 12, color: '#9AA6B8', textAlign: 'center' }}>{t('results.disclaimer', locale)}</div>
      {anchor && det && <PassageModal anchor={anchor} sectionKey={det.key} passages={r.passages} locale={locale} onClose={() => setAnchor(null)} />}
    </div>
  );
}
