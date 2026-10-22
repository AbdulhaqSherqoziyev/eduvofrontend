/**
 * KPI card of the Umumiy tab (§5.2): `ma-kpi` with an "(i)" definition and the §1.6 delta rules.
 * Visits/People: growth green, fall red. Time / single-page: always neutral (not judged).
 * The sign (+ / −) is always printed, so colour never carries the meaning alone.
 */
import { deltaPct, groupNum } from '@/lib/admin-mock/format';
import { InfoPop } from './blocks';
import { T } from './texts';

export interface DeltaView { text: string; trend: 'up' | 'down' | 'flat' }

/** §1.6 for counts */
export function countDelta(cur: number | null, prev: number | null): DeltaView | 'na' | null {
  if (cur === null) return null;
  if (prev === null) return 'na';
  if (prev === 0 && cur > 0) return { text: T.delta.new, trend: 'flat' };
  if (prev < 20) {
    const x = cur - prev;
    return x === 0 ? { text: T.delta.same, trend: 'flat' } : { text: `${x > 0 ? '+' : '−'}${groupNum(Math.abs(x))}`, trend: x > 0 ? 'up' : 'down' };
  }
  if (Math.abs((cur - prev) / prev) < 0.01) return { text: T.delta.same, trend: 'flat' };
  return deltaPct(cur, prev);
}

/** percentage points of two rates (both already allowed to show as a percent) */
export function ppDelta(cur: number, prev: number): DeltaView {
  const d = Math.round((cur - prev) * 1000) / 10;
  if (d === 0) return { text: T.delta.same, trend: 'flat' };
  return { text: `${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)} pp`, trend: d > 0 ? 'up' : 'down' };
}

export function AnKpi({ label, def, value, valueTitle, delta, judged, note, second }: {
  label: string; def: string; value: React.ReactNode; valueTitle?: string;
  delta: DeltaView | 'na' | null;
  /** colour the delta (Tashriflar, Odamlar) */
  judged: boolean;
  /** "o'tgan davrga nisbatan" / "kechaning shu vaqtiga nisbatan" */
  note: string;
  /** muted second line ("488 / 1 284") */
  second?: string | null;
}) {
  const color = delta && delta !== 'na' && judged && delta.trend !== 'flat' ? (delta.trend === 'up' ? 'var(--ok)' : 'var(--err)') : 'var(--ink2)';
  return (
    <div className="ma-kpi">
      <span className="ma-kpi-label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{label}<InfoPop text={def} /></span>
      <span className="ma-kpi-value" title={valueTitle}>{value}</span>
      {second && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mut)', marginTop: -4 }}>{second}</span>}
      {delta && (
        <div className="ma-kpi-foot">
          {delta === 'na' ? <span className="ma-kpi-note">{T.delta.na}</span> : (
            <>
              <span style={{ color }}>{delta.text}</span>
              <span className="ma-kpi-note">{note}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
