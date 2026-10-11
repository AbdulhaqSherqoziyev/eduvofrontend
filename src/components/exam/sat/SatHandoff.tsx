'use client';
/**
 * Module handoff (design D-13 / A-table "Modul qulflash", sat.md §4): when a
 * module's time runs out there is no Time's-up screen and no intro for
 * Module 2 — a 1.5 s "Module n submitted" card, then the next module (or the
 * break) starts by itself. Rendered for phase 'timeup' (server ack pending)
 * and for phase 'intro' when `autoStarts` says the next stage has no intro —
 * including Math Module 1 right after the break ("Break is over…" card).
 */
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { moduleNo, prevLocked } from '@/lib/exam/sat/flow';
import { Bi, Btn, Centered, Spinner } from '../shell/ui';

const HOLD_MS = 1500;

export function SatHandoff() {
  const { s, dispatch, beginStage } = useExam();
  const { t, bi } = useT();
  const [err, setErr] = useState<string | null>(null);
  const started = useRef(false);
  const acked = s.phase === 'timeup' && !!s.timeup?.acked;

  // server confirmed the lock → leave the time-up phase without a Continue button
  useEffect(() => { if (acked) dispatch({ t: 'TIMEUP_ACK' }); }, [acked, dispatch]);

  const go = async () => {
    setErr(null);
    const r = await beginStage();
    if (!r.ok) { setErr(r.code ?? 'network'); started.current = false; }
  };
  useEffect(() => {
    if (s.phase !== 'intro' || started.current) return;
    started.current = true;
    const tm = window.setTimeout(() => void go(), HOLD_MS);
    return () => { window.clearTimeout(tm); started.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.phase, s.stageKey]);

  const prev = s.phase === 'intro' ? prevLocked(s.stages, s.stageKey) : null;
  const afterBreak = prev?.kind === 'break';
  const done = prev && !afterBreak;
  return (
    <Centered>
      <div role="status" aria-live="polite" className="x-fade-in"
        style={{ minWidth: 340, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 18, padding: '22px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
        {done ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: 'var(--x-ok-fg)' }}>
            <Check size={16} aria-hidden />{t('intro.module_submitted', { n: moduleNo(s.stages, prev.stageKey) })}
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: 'var(--x-sub)' }}><Spinner />{t(afterBreak ? 'sat.break_over' : 'sat.saving_module')}</span>
        )}
        {err && (
          <>
            <Bi pair={bi(err === 'network' ? 'banner.offline' : 'errors.server')} size={13.5} center color="var(--x-warn-fg)" />
            <Btn h={40} variant="accent" onClick={() => void go()} style={{ fontSize: 13.5 }}>{t('chrome.retry')}</Btn>
          </>
        )}
      </div>
    </Centered>
  );
}
