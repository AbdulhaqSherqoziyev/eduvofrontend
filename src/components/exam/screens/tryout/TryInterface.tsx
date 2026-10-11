'use client';
/**
 * "Try the interface" (Sevara T2, design G5 + H1): the real player chrome on a
 * sandbox controller — nothing goes to the server, no integrity, no fullscreen.
 * Coach marks (first visit) → 2:00 practice timer → "That's how it works" card.
 */
import { CheckCircle, FlaskConical } from 'lucide-react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { serverNow, useServerNow } from '@/lib/exam/engine/clock';
import { ExamContext, useExam, useT } from '@/lib/exam/engine/context';
import type { ExamCtl } from '@/lib/exam/engine/controller';
import { registerBlob } from '@/lib/exam/engine/media';
import { reducer, type Action } from '@/lib/exam/engine/reducer';
import { initialState } from '@/lib/exam/engine/state';
import { countWords } from '@/lib/exam/format';
import { synthWav } from '@/lib/exam/mock/audio';
import type { Part } from '@/lib/exam/types';
import { QuestionColumn } from '../../questions/QuestionColumn';
import { BottomNav } from '../../shell/BottomNav';
import { ListeningStrip } from '../../shell/ListeningStrip';
import { TopBar } from '../../shell/TopBar';
import { Bi, Btn } from '../../shell/ui';
import { CoachMarks, TOUR_STEPS } from './CoachMarks';
import { TRY_AUDIO, TRY_CONTENT, TRY_STAGE } from './sandbox';

const TOUR_KEY = 'eduvo_exam:tour_done';
const TRY_PART = (TRY_CONTENT as { parts: Part[] }).parts[0];

export function TryInterface() {
  const parent = useExam();
  const { t, bi } = useT();
  const [tour, setTour] = useState(() => { try { return window.localStorage.getItem(TOUR_KEY) ? TOUR_STEPS : 0; } catch { return TOUR_STEPS; } });
  const [startAt, setStartAt] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [text, setText] = useState('');
  const [s, rawDispatch] = useReducer(reducer, parent.s.attemptId, (id) => ({
    ...initialState(id), phase: 'section' as const, config: parent.s.config, ui: parent.s.ui, content: TRY_CONTENT, currentQ: 'try-1',
  }));
  const now = useServerNow(500);

  useEffect(() => { registerBlob(TRY_AUDIO, URL.createObjectURL(new Blob([synthWav(20_000, 2).buffer as ArrayBuffer], { type: 'audio/wav' }))); }, []);
  useEffect(() => { rawDispatch({ t: 'UI', patch: parent.s.ui }); }, [parent.s.ui]);
  useEffect(() => { if (tour >= TOUR_STEPS && startAt == null) setStartAt(serverNow()); }, [tour, startAt]);
  const endTour = () => { try { window.localStorage.setItem(TOUR_KEY, '1'); } catch { /* ignore */ } setTour(TOUR_STEPS); };

  const dispatch = useCallback((a: Action) => { if (a.t === 'MODAL' && a.modal === 'finish') setDone(true); else rawDispatch(a); }, []);
  const stage = useMemo(() => startAt == null ? null : ({
    sectionKey: 'try', stageKey: 'try', kind: 'questions' as const, order: 1, status: 'IN_PROGRESS' as const, startedAt: new Date(startAt).toISOString(),
    deadlineAt: new Date(startAt + 120_000).toISOString(), lockedAt: null, audioStartedAt: new Date(startAt).toISOString(), separateSitting: false,
  }), [startAt]);
  const remaining = startAt == null ? 120 : (startAt + 120_000 - now) / 1000;
  useEffect(() => { if (remaining <= 0) setDone(true); }, [remaining]);

  const ctl = {
    ...parent, s, dispatch, stage, stageCfg: TRY_STAGE, sectionCfg: { key: 'try', title: t('precheck.try_title'), order: 0, stages: [TRY_STAGE] },
    setAnswer: (ids: string[], value: unknown) => rawDispatch({ t: 'ANSWER', ids, value: value as never, seq: Date.now() }),
    integrity: { log: () => undefined },
  } as unknown as ExamCtl;
  const back = () => parent.dispatch({ t: 'PHASE', phase: 'precheck' });

  return (
    <ExamContext.Provider value={ctl}>
      <TopBar sectionTitle={t('precheck.try_title')} remaining={Math.max(0, remaining)} pulse={false} noWarn />
      <div style={{ minHeight: 44, flexShrink: 0, background: 'var(--x-tile)', borderBottom: '1px dashed var(--x-line)', display: 'flex', alignItems: 'center', gap: 10, padding: '4px 22px' }}>
        <FlaskConical size={14} aria-hidden />
        <span style={{ flex: 1 }}><Bi pair={bi('precheck.try_bar')} size={13} weight={700} /></span>
        <button type="button" onClick={back} style={{ background: 'none', border: 'none', color: 'var(--x-link)', fontSize: 13, fontWeight: 700 }}>{t('precheck.try_exit')}</button>
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {startAt != null && <ListeningStrip onAudioError={() => undefined} />}
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}><QuestionColumn part={TRY_PART} label={t('x.part_n', { n: 1 })} wide /></div>
        <div style={{ flexShrink: 0, padding: '0 22px 14px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} placeholder={t('x.start_writing')} data-exam-editor
              style={{ flex: 1, resize: 'none', border: 'none', background: 'transparent', color: 'var(--x-ink)', fontFamily: 'var(--x-serif)', fontSize: 15 }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--x-muted)', whiteSpace: 'nowrap' }}>{t('writing.count_min', { n: countWords(text), m: 10 })}</span>
          </div>
        </div>
      </div>
      <BottomNav />
      {tour < TOUR_STEPS && <CoachMarks step={tour} onNext={() => (tour + 1 >= TOUR_STEPS ? endTour() : setTour(tour + 1))} onSkip={endTour} />}
      {done && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--x-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
          <div className="x-pop" style={{ width: 520, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 22, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <CheckCircle size={32} color="var(--x-ok-fg)" aria-hidden />
            <Bi pair={bi('precheck.try_done')} size={18} weight={800} center />
            <Btn variant="accent" h={48} autoFocus onClick={back} style={{ padding: '0 28px' }}>{t('precheck.try_exit')}</Btn>
          </div>
        </div>
      )}
    </ExamContext.Provider>
  );
}
