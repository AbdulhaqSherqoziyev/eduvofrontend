'use client';
/**
 * Results page: only the "+N pts" chip (leaderboard-design.md §5). No rank, no table, no "to top 10".
 * Tapping it opens "How are points counted?". `removed` and sample results render nothing.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ResultPoints } from '@/lib/mock/api/types';
import { sx } from '@/lib/mock/sx';
import { PointsHowSheet } from './points-how';

const NEUTRAL = sx('background:var(--hover);color:var(--ink2)');

export function PointsChip({ points }: { points: ResultPoints | null | undefined }) {
  const t = useTranslations('results.points');
  const [open, setOpen] = useState(false);
  if (!points || points.status === 'removed') return null;
  const growth = points.items.filter((i) => i.kind === 'growth').reduce((a, i) => a + i.points, 0);
  let label: string;
  let ok = true;
  let note: string | null = null;
  let aria: string | undefined;
  switch (points.status) {
    case 'awarded':
    case 'pending': {
      const base = points.total - growth;
      label = growth > 0 ? `${t('awarded', { n: base })} · ${t('growth', { n: growth })}` : t('awarded', { n: points.total });
      aria = t('chipAria', { n: points.total });
      break;
    }
    case 'capped':
      if (points.total > 0) { label = t('capped', { n: points.total }); aria = t('chipAria', { n: points.total }); } else { label = t('cappedZero'); ok = false; }
      break;
    case 'not_genuine':
      label = t('notCounted'); ok = false;
      note = points.notGenuineReason === 'time' ? t('notCountedTime') : points.notGenuineReason === 'words' ? t('notCountedWords') : t('notCountedAnswers');
      break;
    case 'repeat':
      label = t('repeat'); ok = false;
      break;
    default:
      return null;
  }
  return (
    <>
      <span style={sx('display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap')}>
        <button type="button" className={`m-pill${ok ? ' m-pill--ok' : ''}`} aria-label={aria} onClick={() => setOpen(true)}
          style={{ ...sx('border:0;cursor:pointer;font-family:inherit;white-space:normal;text-align:start'), ...(ok ? {} : NEUTRAL) }}>
          {label}
        </button>
        {note && <span style={sx('font-size:13px;color:var(--ink2);line-height:1.45')}>{note}</span>}
      </span>
      <PointsHowSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
