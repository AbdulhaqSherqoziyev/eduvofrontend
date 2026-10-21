'use client';
/**
 * Segment progress (design q.262–264, spec §1.3 D-9): one 8px bar per recorded item, grouped by part
 * (gap 4 inside a part, 14 between parts), width clamp(10px, …, 36px). Past = ink, current = accent,
 * upcoming = line. Examiner lines get no segment.
 */
import { useT } from '@/lib/exam/engine/context';
import type { SpeakingItem } from '@/lib/exam/speaking-types';

export function SegmentProgress({ items, idx }: { items: SpeakingItem[]; idx: number }) {
  const { t } = useT();
  const rec = items.map((it, i) => ({ it, i })).filter((x) => x.it.records);
  const parts = [1, 2, 3].map((p) => rec.filter((x) => x.it.part === p)).filter((g) => g.length);
  const n = rec.length;
  const w = `clamp(10px, calc((660px - ${(n - parts.length) * 4 + (parts.length - 1) * 14}px) / ${Math.max(1, n)}), 36px)`;
  const cur = items[idx];
  const curRec = rec.findIndex((x) => x.i >= idx);
  const inPart = cur ? rec.filter((x) => x.it.part === cur.part) : [];
  const qNo = cur ? Math.max(1, inPart.findIndex((x) => x.i >= idx) + 1) : 0;
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={Math.max(0, curRec)}
      aria-label={cur ? `${t('speaking.part_n', { n: cur.part })}, ${t('speaking.question_n_of_m', { n: qNo, m: inPart.length })}` : undefined}
      style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 660 }}>
      {parts.map((g, gi) => (
        <div key={gi} style={{ display: 'flex', gap: 4 }}>
          {g.map(({ i }) => (
            <div key={i} style={{ height: 8, width: w, borderRadius: 4, background: i < idx ? 'var(--x-ink)' : i === idx ? 'var(--x-accent)' : 'var(--x-line)' }} />
          ))}
        </div>
      ))}
    </div>
  );
}
