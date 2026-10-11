'use client';
/**
 * "Question n of N ▴" pop-over (design q.326–334, sat.md §4): this module's
 * questions only. 38px cells — answered dark, unanswered tile, current
 * ringed, For Review = bookmark dot. Legend by shape + text (Current /
 * Unanswered / For Review). "Go to Review Page" opens Check Your Work.
 */
import { Bookmark, MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { answered, type FlatQ } from '@/lib/exam/engine/selectors';
import { useSatTools } from '@/lib/exam/sat/tools';
import { Btn } from '../shell/ui';

export function GridCell({ q, n, current, size = 38, onGo, bookmark }: { q: FlatQ; n: number; current: boolean; size?: number; onGo: () => void; bookmark?: boolean }) {
  const { s } = useExam();
  const done = answered(s.answers, q.id);
  const flag = !!s.flags[q.id];
  const states = [current ? 'current' : null, done ? 'answered' : 'unanswered', flag ? 'for review' : null].filter(Boolean).join(', ');
  return (
    <button type="button" onClick={onGo} aria-label={`Question ${n}, ${states}`} aria-current={current ? 'step' : undefined}
      style={{ position: 'relative', width: size, height: size, borderRadius: 8, border: done || current ? 'none' : '1.5px dashed var(--x-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800,
        background: current ? 'var(--x-panel)' : done ? 'var(--x-nav-ans-bg)' : 'var(--x-tile)', color: current ? 'var(--x-accent)' : done ? 'var(--x-nav-ans-fg)' : 'var(--x-muted)', boxShadow: current ? 'inset 0 0 0 2px var(--x-accent)' : 'none' }}>
      {n}
      {flag && (bookmark
        ? <Bookmark aria-hidden size={14} fill="var(--x-flag)" color="var(--x-flag)" style={{ position: 'absolute', top: -6, right: -4 }} />
        : <span aria-hidden style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: '50%', background: 'var(--x-flag)', border: '2px solid var(--x-panel)' }} />)}
      {current && <MapPin aria-hidden size={12} color="var(--x-accent)" style={{ position: 'absolute', top: -13, left: '50%', marginLeft: -6 }} />}
    </button>
  );
}

export function Legend({ bookmark }: { bookmark?: boolean }) {
  const { t } = useT();
  const item = { display: 'inline-flex', alignItems: 'center', gap: 6 } as const;
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12, color: 'var(--x-muted)', fontWeight: 700 }}>
      <span style={item}><MapPin size={13} color="var(--x-accent)" aria-hidden />{t('sat.legend_current')}</span>
      <span style={item}><span aria-hidden style={{ width: 12, height: 12, borderRadius: 3, border: '1.5px dashed var(--x-border)', background: 'var(--x-tile)' }} />{t('sat.legend_unanswered')}</span>
      <span style={{ ...item, color: 'var(--x-flag)' }}>
        {bookmark ? <Bookmark size={13} fill="var(--x-flag)" aria-hidden /> : <span aria-hidden style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--x-flag)' }} />}
        {t('sat.legend_review')}
      </span>
    </div>
  );
}

export function SatNavigator({ flat, title }: { flat: FlatQ[]; title: string }) {
  const { s, dispatch } = useExam();
  const { t } = useT();
  const tools = useSatTools();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') tools.setGrid(false); };
    const down = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!box.current?.contains(el) && !el.closest('[data-sat-grid-toggle]')) tools.setGrid(false);
    };
    document.addEventListener('keydown', key);
    document.addEventListener('mousedown', down);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('mousedown', down); };
  }, [tools]);
  const go = (q: FlatQ) => { dispatch({ t: 'GOTO', partIdx: q.partIdx, q: q.id }); tools.setReview(false); tools.setGrid(false); };
  return (
    <div ref={box} role="dialog" aria-label={t('sat.grid_title', { title })} className="x-pop"
      style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', width: 460, background: 'var(--x-panel)', border: '1px solid var(--x-pop-border)', borderRadius: 16, boxShadow: 'var(--x-pop-shadow)', padding: '18px 20px', zIndex: 6 }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{t('sat.grid_title', { title })}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 8 }}>
        {flat.map((q, i) => <GridCell key={q.id} q={q} n={i + 1} current={!tools.review && q.id === s.currentQ} onGo={() => go(q)} />)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
        <Legend />
        <Btn h={34} onClick={() => { tools.setReview(true); tools.setGrid(false); }} style={{ fontSize: 12.5, padding: '0 12px' }}>{t('sat.go_review')}</Btn>
      </div>
    </div>
  );
}
