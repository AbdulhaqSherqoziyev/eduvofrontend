'use client';
/**
 * Finish modal (Sevara T16, design G2): live time left, clickable unanswered
 * chips, flagged chips, "can't return". Default focus = Keep working; Esc and
 * the overlay also mean Keep working. finish.* texts are always bilingual.
 */
import { CheckCircle, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { flatQuestions, tasksOf, unansweredNos } from '@/lib/exam/engine/selectors';
import { countWords, fmtClock } from '@/lib/exam/format';
import { Btn, Spinner } from './ui';

function Pair({ p, size = 14, weight = 600, color }: { p: [string, string]; size?: number; weight?: number; color?: string }) {
  return (
    <div style={{ color: color ?? 'var(--x-ink)' }}>
      <div style={{ fontSize: size, fontWeight: weight }}>{p[0]}</div>
      <div style={{ fontSize: size - 2, color: 'var(--x-muted)' }}>{p[1]}</div>
    </div>
  );
}

const chip = { minWidth: 34, height: 30, borderRadius: 8, border: 'none', background: 'var(--x-tile)', color: 'var(--x-ink)', fontSize: 13, fontWeight: 800, padding: '0 6px', position: 'relative' } as const;

export function FinishModal({ remaining, sectionTitle }: { remaining: number | null; sectionTitle: string }) {
  const { s, dispatch, submit } = useExam();
  const { t, bi, bin } = useT();
  const keepRef = useRef<HTMLButtonElement>(null);
  const [all, setAll] = useState(false);
  const close = () => dispatch({ t: 'MODAL', modal: null });

  useEffect(() => {
    keepRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tasks = tasksOf(s.content);
  const un = unansweredNos(s.content, s.answers);
  const flagged = flatQuestions(s.content).filter((q) => s.flags[q.id]);
  const below = tasks.map((tk) => ({ tk, n: countWords(String(s.answers[tk.questionId]?.v ?? '')) })).filter((x) => x.tk.minWords && x.n < x.tk.minWords);
  const shown = all ? un : un.slice(0, 15);
  const jump = (partIdx: number, id: string) => { dispatch({ t: 'GOTO', partIdx, q: id }); close(); };
  const unPair = bin('finish.unanswered', un.length);

  return (
    <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'var(--x-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
      <div role="dialog" aria-modal="true" aria-labelledby="x-finish-title" className="x-pop" onClick={(e) => e.stopPropagation()}
        style={{ width: 480, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div id="x-finish-title"><Pair p={bi('finish.title', { section: sectionTitle })} size={20} weight={800} /></div>
        {remaining != null && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Clock size={16} style={{ marginTop: 2 }} aria-hidden />
            <Pair p={bi('finish.time_left', { t: fmtClock(remaining) })} />
          </div>
        )}
        {un.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Pair p={unPair} weight={700} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {shown.map((q) => <button key={q.id} type="button" style={chip} onClick={() => jump(q.partIdx, q.id)}>{q.no}</button>)}
              {!all && un.length > 15 && <button type="button" style={chip} onClick={() => setAll(true)}>+{un.length - 15}</button>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--x-muted)' }}>{t('finish.chip_hint')}</div>
          </div>
        )}
        {flagged.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Pair p={bi('finish.flagged', { n: flagged.length })} weight={700} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {flagged.map((q) => (
                <button key={q.id} type="button" style={{ ...chip, minWidth: 30, width: 30, borderRadius: '50%' }} onClick={() => jump(q.partIdx, q.id)}>
                  {q.no}<span aria-hidden style={{ position: 'absolute', top: -1, right: -1, width: 7, height: 7, borderRadius: '50%', background: 'var(--x-flag)' }} />
                </button>
              ))}
            </div>
          </div>
        )}
        {below.map(({ tk, n }) => <Pair key={tk.key} p={bi('finish.below_min', { task: tk.label ?? tk.key, n, m: tk.minWords ?? 0 })} />)}
        {!tasks.length && un.length === 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--x-ok-fg)' }}>
            <CheckCircle size={16} style={{ marginTop: 2 }} aria-hidden /><Pair p={bi('finish.all_answered')} color="var(--x-ok-fg)" />
          </div>
        )}
        <Pair p={bi('finish.no_return')} color="var(--x-sub)" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
          <Btn ref={keepRef} h={44} onClick={close}>{t('chrome.keep_working')}</Btn>
          <Btn variant="dark" h={44} disabled={s.submitting} onClick={() => void submit('user')}>
            {s.submitting ? <><Spinner size={14} /> {t('finish.submitting')}</> : t('chrome.finish_and_lock')}
          </Btn>
        </div>
      </div>
    </div>
  );
}
