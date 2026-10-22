/** §3.5 live number card (`ma-kpi` + 32px value; small variant 24px). 0 is plain ink, never red; no animation. */
import { groupNum } from '@/lib/admin-mock/format';
import { InfoPop } from './blocks';
import { T } from './texts';

export function LiveCard({ label, value, foot, def, small, mob }: {
  label: string; value: number | null; foot: string; def: string; small?: boolean; mob?: boolean;
}) {
  const size = small ? (mob ? 22 : 24) : mob ? 28 : 32;
  return (
    <div className="ma-kpi" style={small ? { gap: 4 } : undefined}>
      <span className="ma-kpi-label" style={{ display: 'flex', gap: 6, alignItems: 'flex-start', textTransform: small ? undefined : 'uppercase', letterSpacing: small ? undefined : '.03em' }}>
        <span style={{ minWidth: 0 }}>{label}</span>
        <InfoPop text={def} />
      </span>
      <span style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--ink)' }} title={value === null ? T.state.loadErr : undefined}>{value === null ? '—' : groupNum(value)}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mut)' }}>{foot}</span>
    </div>
  );
}
