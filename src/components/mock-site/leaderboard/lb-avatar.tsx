/**
 * LbAvatar (leaderboard-design.md §2.2 + §13.16): initials disc; top 3 get a 3px gold/silver/bronze
 * ring and an 18px medal dot with the rank number (colour is never the only signal — number +
 * aria-label). Hidden participants: inset disc with a neutral silhouette glyph (not "?").
 */
import type { CSSProperties } from 'react';

const MEDAL = ['var(--gold)', 'var(--silver)', 'var(--bronze)'];
/** px: [normal, top-3] */
const SIZES = { md: [40, 44], sm: [36, 40], xs: [32, 32] } as const;

export function medalColor(rank: number): string | null {
  return rank >= 1 && rank <= 3 ? MEDAL[rank - 1] : null;
}

export function LbAvatar({ rank, initials, hidden, size = 'md', medal = true, medalLabel }: {
  rank?: number; initials: string | null; hidden: boolean; size?: keyof typeof SIZES; medal?: boolean; medalLabel?: string;
}) {
  const ring = medal && rank != null ? medalColor(rank) : null;
  const px = SIZES[size][ring ? 1 : 0];
  const base = hidden ? 'var(--inset)' : 'var(--raise-sm)';
  const style: CSSProperties = { width: px, height: px, fontSize: size === 'md' ? 14 : size === 'sm' ? 13 : 12, boxShadow: ring ? `0 0 0 3px ${ring}, ${base}` : base };
  return (
    <span className={`m-lb-av${hidden ? ' m-lb-av--hidden' : ''}`} style={style}>
      {hidden || !initials ? <Silhouette px={px} /> : <span aria-hidden>{initials}</span>}
      {ring && (
        <span className="m-lb-av__medal" style={{ background: ring }} role="img" aria-label={medalLabel}>
          <bdi dir="ltr" aria-hidden>{rank}</bdi>
        </span>
      )}
    </span>
  );
}

/** neutral person glyph: head + shoulders, muted */
function Silhouette({ px }: { px: number }) {
  const s = Math.round(px * 0.5);
  return (
    <svg aria-hidden width={s} height={s} viewBox="0 0 20 20" style={{ color: 'var(--mut)' }}>
      <circle cx="10" cy="7" r="4" fill="currentColor" />
      <path d="M2.5 19c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7z" fill="currentColor" />
    </svg>
  );
}
