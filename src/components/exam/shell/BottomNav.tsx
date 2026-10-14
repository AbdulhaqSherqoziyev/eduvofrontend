'use client';
/**
 * Bottom navigator 70px (design A8). Box states by colour AND shape: answered
 * (dark), unanswered (tile), current (inset ring), flagged (circle + dot),
 * locked (.45 + lock). Next is the only primary; Finish section always opens the modal.
 */
import { Lock } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useExamHost } from '../host';
import { useExam, useT } from '@/lib/exam/engine/context';
import { answered, flatQuestions, partsOf, tasksOf } from '@/lib/exam/engine/selectors';
import { PreviewFinish } from './PreviewFinish';
import { Btn } from './ui';

interface Box { id: string; label: string; partIdx: number; done: boolean }

export function BottomNav({ finishDisabled, finishHint }: { finishDisabled?: boolean; finishHint?: string }) {
  const { s, dispatch, stageCfg } = useExam();
  const { t } = useT();
  const host = useExamHost();
  const navRef = useRef<HTMLElement>(null);
  const back = stageCfg?.nav?.back !== false;
  const hideUpcoming = !!stageCfg?.nav?.hide_upcoming;
  const tasks = tasksOf(s.content);
  const parts = partsOf(s.content);
  const flat = flatQuestions(s.content);

  const groups: { label: string; partIdx: number; boxes: Box[] }[] = tasks.length
    ? tasks.map((tk, i) => ({ label: tk.label ?? tk.key, partIdx: i, boxes: [{ id: tk.questionId, label: `T${i + 1}`, partIdx: i, done: answered(s.answers, tk.questionId) }] }))
    : parts.map((p, i) => ({ label: t(p.passageHtml && s.config?.family === 'IELTS' ? 'x.nav_passage' : 'x.nav_part', { n: p.part }), partIdx: i, boxes: flat.filter((q) => q.partIdx === i).map((q) => ({ id: q.id, label: String(q.no), partIdx: i, done: answered(s.answers, q.id) })) }));
  const last = groups.length - 1;
  const go = (partIdx: number, q: string | null) => dispatch({ t: 'GOTO', partIdx, q });
  const cur = s.currentQ;
  const canFlag = !tasks.length && !!cur && stageCfg?.nav?.flag !== false;
  // many questions (IELTS 40) do not fit one row at 1440: keep the current box in view
  useEffect(() => {
    const el = navRef.current?.querySelector('[aria-current="step"]') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [cur, s.partIdx]);

  if (host.b2c) {
    // Player.dc.html footer: Part tabs · numbers of the current part · Back / Next (Submit is in the top bar)
    const g = groups[s.partIdx] ?? groups[0];
    const curQ = flat.find((q) => q.id === cur);
    // questions inside a template / multi / map group have no card of their own → their Review flag lives here
    const cardless = !!curQ && (!!curQ.group.content?.template || !!curQ.group.multiGroup || curQ.group.layout === 'map' || curQ.group.questions[0]?.type === 'mcq_multi' || curQ.group.questions[0]?.type === 'map_labelling');
    return (
      <div style={{ height: 70, flexShrink: 0, background: 'var(--x-panel)', borderTop: '1px solid var(--x-line)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px' }}>
        <nav ref={navRef} aria-label={t('chrome.review')} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 14, overflowX: 'auto', padding: '6px 2px' }}>
          <div role="tablist" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {groups.map((gr) => {
              const locked = !back && gr.partIdx < s.partIdx;
              if (hideUpcoming && gr.partIdx > s.partIdx) return null;
              const on = gr.partIdx === s.partIdx;
              return (
                <button key={gr.partIdx} type="button" role="tab" aria-selected={on} disabled={locked} onClick={() => go(gr.partIdx, gr.boxes[0]?.id ?? null)}
                  style={{ height: 36, padding: '0 12px', borderRadius: 10, border: on ? '1.5px solid var(--x-focus)' : '1.5px solid var(--x-line)', background: on ? 'var(--x-sel-bg)' : 'transparent', color: on ? 'var(--x-sel-fg)' : 'var(--x-sub)', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, opacity: locked ? 0.45 : 1 }}>
                  {locked && <Lock size={11} aria-hidden />}{gr.label}
                </button>
              );
            })}
          </div>
          {!tasks.length && g && (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {g.boxes.map((b) => {
                const isCur = cur === b.id;
                const flag = !!s.flags[b.id];
                const states = [b.done ? 'answered' : 'unanswered', flag ? t('chrome.flagged').toLowerCase() : null].filter(Boolean).join(', ');
                return (
                  <button key={b.id} type="button" onClick={() => go(b.partIdx, b.id)} aria-label={`Question ${b.label}, ${states}`} aria-current={isCur ? 'step' : undefined}
                    style={{ minWidth: 32, height: 32, padding: '0 6px', borderRadius: 9, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                      border: flag ? '2px solid var(--x-flag)' : 'none',
                      background: b.done ? 'var(--x-accent)' : 'var(--x-tile)', color: b.done ? '#fff' : 'var(--x-sub)',
                      boxShadow: isCur ? '0 0 0 2px var(--x-panel), 0 0 0 4px var(--x-focus)' : 'none' }}>{b.label}</button>
                );
              })}
            </div>
          )}
        </nav>
        <PreviewFinish />
        {canFlag && cardless && (
          <Btn onClick={() => dispatch({ t: 'FLAG', id: cur! })} style={{ color: 'var(--x-flag)', fontSize: 13 }}>{s.flags[cur!] ? t('chrome.unflag') : t('x.review_flag')}</Btn>
        )}
        {back && <Btn disabled={s.partIdx === 0} onClick={() => go(s.partIdx - 1, groups[s.partIdx - 1]?.boxes[0]?.id ?? null)} style={{ fontSize: 13 }}>{t('x.back')}</Btn>}
        <Btn variant="accent" disabled={s.partIdx >= last} onClick={() => go(s.partIdx + 1, groups[s.partIdx + 1]?.boxes[0]?.id ?? null)} style={{ fontSize: 13, padding: '0 20px' }}>{t('chrome.next')}</Btn>
      </div>
    );
  }

  return (
    <div style={{ height: 70, flexShrink: 0, background: 'var(--x-panel)', borderTop: '1px solid var(--x-line)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px' }}>
      <nav ref={navRef} aria-label={t('chrome.review')} style={{ flex: 1, minWidth: 0, display: 'flex', gap: 14, overflowX: 'auto', padding: '6px 0' }}>
        {groups.map((g) => {
          const locked = !back && g.partIdx < s.partIdx;
          if (hideUpcoming && g.partIdx > s.partIdx) return null;
          return (
            <div key={g.partIdx} style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, opacity: locked ? 0.45 : 1 }}>
              <button type="button" disabled={locked} onClick={() => go(g.partIdx, g.boxes[0]?.id ?? null)}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, color: g.partIdx === s.partIdx ? 'var(--x-accent)' : 'var(--x-muted)' }}>
                {locked && <Lock size={11} aria-hidden />}{g.label}
              </button>
              <div style={{ display: 'flex', gap: 2 }}>
                {g.boxes.map((b) => {
                  const isCur = tasks.length ? b.partIdx === s.partIdx : cur === b.id;
                  const flag = !!s.flags[b.id];
                  const states = [b.done ? 'answered' : 'unanswered', flag ? t('chrome.flagged').toLowerCase() : null].filter(Boolean).join(', ');
                  return (
                    <button key={b.id} type="button" disabled={locked} onClick={() => go(b.partIdx, tasks.length ? null : b.id)}
                      aria-label={`${tasks.length ? b.label : `Question ${b.label}`}, ${states}`} aria-current={isCur ? 'step' : undefined} title={flag ? t('chrome.flagged') : undefined}
                      style={{ position: 'relative', minWidth: 24, height: flag ? 24 : 30, width: flag ? 24 : undefined, padding: flag ? 0 : '0 4px', margin: flag ? '3px 0' : 0, borderRadius: flag ? '50%' : 5, border: 'none', fontSize: 11, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: locked ? 'not-allowed' : 'pointer',
                        background: isCur ? 'var(--x-panel)' : b.done ? 'var(--x-nav-ans-bg)' : 'var(--x-tile)', color: isCur ? 'var(--x-accent)' : b.done ? 'var(--x-nav-ans-fg)' : 'var(--x-muted)',
                        boxShadow: isCur ? 'inset 0 0 0 2px var(--x-focus)' : 'none' }}>
                      {b.label}
                      {flag && <span aria-hidden style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: 'var(--x-flag)', boxShadow: '0 0 0 1.5px var(--x-panel)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <PreviewFinish />
      {canFlag && (
        <Btn onClick={() => dispatch({ t: 'FLAG', id: cur! })} style={{ color: 'var(--x-flag)', fontSize: 13 }}>{s.flags[cur!] ? t('chrome.unflag') : t('chrome.flag')}</Btn>
      )}
      {back && s.partIdx > 0 && <Btn onClick={() => go(s.partIdx - 1, groups[s.partIdx - 1]?.boxes[0]?.id ?? null)} style={{ fontSize: 13 }}>{t('chrome.previous')}</Btn>}
      {s.partIdx < last && <Btn variant="accent" onClick={() => go(s.partIdx + 1, groups[s.partIdx + 1]?.boxes[0]?.id ?? null)} style={{ fontSize: 13, padding: '0 20px' }}>{t('chrome.next')}</Btn>}
      <Btn variant="dark" disabled={finishDisabled} title={finishDisabled ? finishHint : undefined} onClick={() => dispatch({ t: 'MODAL', modal: 'finish' })} style={{ fontSize: 13 }}>{t('chrome.finish_section')}</Btn>
    </div>
  );
}
