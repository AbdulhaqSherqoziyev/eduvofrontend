'use client';
/**
 * SpeakingResultPanel (speaking-design.md §2) — ONE structure, three skins:
 * (a) `hub` ERP student result, (b) `flat` player result (staff preview), (c) `b2c` mock.eduvo.uz.
 * Draws only the contract §4 `speaking` block (never `ai[]`): header, states, feedback, 4 criteria,
 * "Javoblaringiz" (audio + transcript), delete (learner only), "Natija adolatli emasmi?".
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SpeakingResult } from '@/lib/exam/speaking-types';
import { Ctx, type PanelMode, type SpeakingCtx, type Tx } from './context';
import { CriterionCard } from './CriterionCard';
import { DeleteAudio } from './DeleteAudio';
import { Feedback } from './Feedback';
import { Header } from './Header';
import { Recordings } from './Recordings';
import { SKINS, type SkinName } from './skin';
import { type B2cExtras, GradingStepper, NoScore, NotTaken, Skeleton } from './States';

const CSS = `.sp-phone-only{display:none}
@media (max-width:519px){.sp-phone-only{display:block}.sp-desk-only{display:none!important}}
@media (max-width:640px){.sp-crit{grid-template-columns:1fr!important}.sp-qplay{width:36px!important;height:36px!important}
.sp-quote{flex-wrap:wrap;justify-content:flex-end}.sp-quote>span:first-child{flex-basis:100%}
.sp-q{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sp-clip-row{flex-direction:column;align-items:stretch!important}.sp-clip-row>div{min-width:0!important}.sp-tbtn{min-height:44px!important;text-align:start}
.sp-delbtn{width:100%;height:44px!important}.sp-del{flex-direction:column;align-items:stretch!important}}
@media print{.print-hide{display:none!important}}`;

export interface SpeakingPanelProps {
  sp: SpeakingResult | null | undefined;
  skin: SkinName;
  mode: PanelMode;
  tx: Tx;
  loading?: boolean;
  /** Learner only (ERP student / B2C): deletes all recordings; throw to show `delete_failed`. */
  onDelete?: () => Promise<void>;
  /** Toast host (B2C `useToast`); otherwise a local 3 s toast. */
  onToast?: (msg: string) => void;
  /** "Speaking'ni topshirish" link while Speaking is pending. */
  takeHref?: string | null;
  phoneNote?: ReactNode;
  b2c?: B2cExtras;
  noAudioNote?: string;
  /** Staff page draws its own answers table (spec §3.2) instead of the accordion. */
  hideRecordings?: boolean;
  gradingNote?: string;
  /** Re-read the result: an expired signed audio URL (contract §5) gets a fresh one. */
  onRefresh?: () => void;
}

export function SpeakingResultPanel({ sp, skin, mode, tx, loading, onDelete, onToast, takeHref, phoneNote, b2c, noAudioNote, hideRecordings, gradingNote, onRefresh }: SpeakingPanelProps) {
  const s = SKINS[skin];
  const [openParts, setOpenParts] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState<SpeakingCtx['playing']>(null);
  const [toast, setToast] = useState('');
  const [unfair, setUnfair] = useState(false);
  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(''), 3000); return () => window.clearTimeout(id); }, [toast]);
  const playItem = useCallback((itemKey: string) => {
    const part = sp?.items.find((i) => i.itemKey === itemKey)?.part;
    if (part != null) setOpenParts((o) => new Set(o).add(part));
    setPlaying({ itemKey, nonce: Date.now() });
  }, [sp]);
  const ctx = useMemo<SpeakingCtx | null>(() => (sp ? { sp, skin: s, tx, mode, playItem, playing, noAudioNote, gradingNote, refresh: onRefresh } : null), [sp, s, tx, mode, playItem, playing, noAudioNote, gradingNote, onRefresh]);

  if (!ctx || !sp) {
    if (!loading) return null;
    return <Ctx.Provider value={{ sp: {} as SpeakingResult, skin: s, tx, mode, playItem, playing: null }}><Skeleton /></Ctx.Provider>;
  }
  const grading = ['received', 'transcribing', 'scoring'].includes(sp.status);
  const noScore = ['no_response', 'too_short', 'needs_review', 'not_graded', 'not_taken'].includes(sp.status);
  const learner = mode === 'erp' || mode === 'b2c';

  return (
    <Ctx.Provider value={ctx}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section aria-label="Speaking" style={{ display: 'flex', flexDirection: 'column', gap: 18, color: s.ink }}>
        <Header />
        {sp.status === 'pending' && <NotTaken takeHref={takeHref} phoneNote={phoneNote} />}
        {grading && <GradingStepper />}
        {noScore && <NoScore b2c={b2c} />}
        {sp.status === 'ready' && sp.criteria && (
          <>
            <Feedback />
            <div className="sp-crit" style={{ display: 'grid', gridTemplateColumns: skin === 'b2c' ? 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))' : 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
              {sp.criteria.map((c) => <CriterionCard key={c.key} c={c} />)}
            </div>
          </>
        )}
        {sp.status === 'ready' && !sp.criteria && sp.teacherReviewed && <Feedback />}
        {sp.status !== 'pending' && sp.status !== 'not_taken' && !hideRecordings && <Recordings openParts={openParts} setOpenParts={setOpenParts} />}
        {learner && onDelete && sp.status !== 'pending' && sp.status !== 'not_taken' && !noAudioNote && (
          <DeleteAudio onDelete={onDelete} onDone={() => (onToast ? onToast(tx('results.audio_deleted')) : setToast(tx('results.audio_deleted')))} />
        )}
        {learner && sp.status !== 'pending' && (
          mode === 'b2c'
            ? (b2c?.unfairHref && sp.status === 'ready' ? <a href={b2c.unfairHref} style={{ fontSize: 13.5, fontWeight: 700, color: s.accent, alignSelf: 'flex-start' }}>{tx('results.unfair')} →</a> : null)
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                <button type="button" aria-expanded={unfair} onClick={() => setUnfair((v) => !v)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: s.accent }}>{tx('results.unfair')}</button>
                {unfair && <div style={{ fontSize: 13.5, color: s.sub, lineHeight: 1.55 }}>{tx('results.unfair_center')}</div>}
              </div>
            )
        )}
        <div role="status" aria-live="polite">
          {toast && <div style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', background: '#1E2A3A', color: '#fff', borderRadius: 12, padding: '10px 16px', fontSize: 14, fontWeight: 700, zIndex: 120 }}>{toast}</div>}
        </div>
      </section>
    </Ctx.Provider>
  );
}
