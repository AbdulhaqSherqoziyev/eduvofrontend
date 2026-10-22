/**
 * §3.3 horizontal steps (Dashboard "Voronka" look): name left, count right with " · P%" of the
 * previous step only when that denominator ≥ 20, otherwise "N / M" (§18.6). Track 10px inset,
 * gradient fill relative to step 1 (min 3%); "<5" → fixed 6px stub; 0 → empty track.
 */
import { cnt, cntNum, ratioView } from '@/lib/admin-mock/format';
import type { Cnt } from '@/lib/admin-mock/types';

export interface Step {
  key: string;
  label: string;
  value: Cnt | null;
  /** muted source line under the track ("tashriflar bo'yicha") */
  source?: string;
  /** reason shown when `value` is null ("—") */
  dashTitle?: string;
  /** title for "—" instead of a percent when this step is larger than the previous one */
  overflowTitle?: string;
}

export function Steps({ steps }: { steps: Step[] }) {
  const first = cntNum(steps[0]?.value) ?? 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const v = cntNum(s.value);
        let right: React.ReactNode;
        if (s.value === null) right = <span title={s.dashTitle}>—</span>;
        else if (i === 0 || prev === null) right = cnt(s.value);
        else if (v !== null && typeof prev === 'number' && v > prev) {
          right = <>{cnt(s.value)} <span style={{ color: 'var(--mut)', fontWeight: 600 }}>· <span title={s.overflowTitle}>—</span></span></>;
        } else {
          const r = ratioView(s.value, prev);
          right = r.pct ? <>{cnt(s.value)} <span style={{ color: 'var(--mut)', fontWeight: 600 }}>· {r.pct}</span></> : r.frac;
        }
        const width = s.value === '<5' ? '6px' : v && first ? `${Math.max(3, Math.min(100, (v / first) * 100))}%` : '0';
        return (
          <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, fontWeight: 700 }}>
              <span>{s.label}</span>
              <span style={{ color: 'var(--ink2)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{right}</span>
            </div>
            <div style={{ height: 10, borderRadius: 999, boxShadow: 'var(--inset)', overflow: 'hidden' }}>
              {width !== '0' && <div style={{ height: '100%', width, borderRadius: 999, background: 'linear-gradient(135deg,#5B8DEF,#2E6BE6)', opacity: s.value === '<5' ? 0.45 : 1 }} />}
            </div>
            {s.source && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)' }}>{s.source}</span>}
          </div>
        );
      })}
    </div>
  );
}
