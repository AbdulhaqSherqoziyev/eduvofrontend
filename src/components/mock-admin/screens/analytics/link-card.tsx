'use client';
/**
 * Phone Dashboard → Analitika (Abdulhaq's choice for spec Q3: a link card on top of the home screen;
 * the 4-item bottom nav stays as designed). Live counts are shown side by side, never summed (M1).
 * Loading: skeleton instead of the numbers; error: the title only.
 */
import Link from 'next/link';
import { groupNum } from '@/lib/admin-mock/format';
import { T } from './texts';
import { useLive } from './tab-now';

export function AnalyticsLinkCard() {
  const q = useLive();
  const d = q.data;
  return (
    <Link href="/analytics" className="ma-hover-row"
      style={{ borderRadius: 20, boxShadow: 'var(--raise)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--ink)' }}>
      <b style={{ fontSize: 15, fontWeight: 800, color: 'var(--blue)' }}>{T.dashLink}</b>
      {d ? (
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>
          {T.now.guests} <b style={{ color: 'var(--ink)' }}>{groupNum(d.site.guests)}</b> · {T.now.learners} <b style={{ color: 'var(--ink)' }}>{groupNum(d.site.learners)}</b>
        </span>
      ) : !q.isError && <span className="ma-skel" style={{ width: '70%', height: 14 }} aria-hidden="true" />}
    </Link>
  );
}
