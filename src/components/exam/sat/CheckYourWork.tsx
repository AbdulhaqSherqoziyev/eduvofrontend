'use client';
/**
 * "Check Your Work" (design G11, sat.md §4 S3): after the last question's Next.
 * Every question of this module as a 38px grid (same states as the pop-over,
 * For Review = bookmark), shape + text legend; any cell jumps back. There is no
 * "Finish module" on test day — the module closes when its time runs out.
 * (Staff preview gets "Finish module (preview)" from <SatBottomBar> under this view.)
 */
import { useExam, useT } from '@/lib/exam/engine/context';
import type { FlatQ } from '@/lib/exam/engine/selectors';
import { useSatTools } from '@/lib/exam/sat/tools';
import { GridCell, Legend } from './SatNavigator';

export function CheckYourWork({ flat, title }: { flat: FlatQ[]; title: string }) {
  const { dispatch } = useExam();
  const { t } = useT();
  const tools = useSatTools();
  const go = (q: FlatQ) => { dispatch({ t: 'GOTO', partIdx: q.partIdx, q: q.id }); tools.setReview(false); };
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'var(--x-page)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.4 }}>{t('sat.check_title')}</h1>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--x-sub)', lineHeight: 1.55 }}>{t('sat.check_body')}</p>
        <div style={{ width: '100%', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 18, padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderBottom: '1px solid var(--x-line)', paddingBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{title}</span>
            <Legend bookmark />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 6 }}>
            {flat.map((q, i) => <GridCell key={q.id} q={q} n={i + 1} current={false} bookmark onGo={() => go(q)} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
