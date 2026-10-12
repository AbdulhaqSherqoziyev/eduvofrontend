'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ResultRowFull } from '@/lib/api/center-exams';
import { formatScore } from '../exam-meta';
import { SH } from '../tokens';

/** Design v3 RESULTS columns — fixed L / R / W / S (+ UMUMIY, CEFR). */
export const SECTION_KEYS = ['listening', 'reading', 'writing', 'speaking'] as const;
type Key = (typeof SECTION_KEYS)[number];

const COLS = 'grid grid-cols-[2fr_repeat(4,1fr)_1fr_0.8fr_16px] gap-3.5 min-w-[740px]';

/** One score cell: the READY label ("7.5"); "Baholanmoqda" (purple) while AI grades. */
function Cell({ r, k }: { r: ResultRowFull; k: Key }) {
  const s = r.sections.find((x) => x.key === k);
  if (s?.status === 'GRADING' || s?.status === 'NEEDS_HUMAN') return <div className="font-bold text-[#5B3FD1]">Baholanmoqda</div>;
  const v = r[k] ?? (s?.status === 'READY' ? s.label ?? formatScore(s.scaled) : null);
  return <div className="font-bold">{v ?? '—'}</div>;
}

/** Results card body (design: rows with inset shadow, overall in primary, CEFR pill). */
export function ResultsTable({ rows }: { rows: ResultRowFull[] }) {
  return (
    <div className="overflow-x-auto">
      <div className={`${COLS} px-4 pb-3 text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8]`}>
        <div>O&apos;QUVCHI</div><div>LISTENING</div><div>READING</div><div>WRITING</div><div>SPEAKING</div><div>UMUMIY</div><div>CEFR</div><div />
      </div>
      {rows.map((r) => (
        <Link
          key={r.attemptId}
          href={`/exams/results/${encodeURIComponent(r.attemptId)}`}
          className={`${COLS} mb-1.5 items-center rounded-[14px] px-4 py-3 text-[14px] text-foreground transition-colors hover:bg-[#EEF3FC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary dark:hover:bg-white/5 ${SH.row}`}
        >
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate font-bold">{r.isPreview ? r.previewBy?.fullName ?? r.fullName : r.fullName}</span>
              {r.isPreview ? <span className="shrink-0 rounded-[7px] bg-[#FFF1D6] px-2 py-0.5 text-[10.5px] font-extrabold tracking-[0.4px] text-[#7A4E00]">SINOV</span> : null}
            </div>
            {r.status === 'ACTIVE' ? <div className="text-[11px] font-bold text-primary">Davom etmoqda</div> : null}
            {r.isPreview && r.testTitle ? <div className="truncate text-[11.5px] font-semibold text-muted">{r.testTitle}</div> : null}
          </div>
          {SECTION_KEYS.map((k) => <Cell key={k} r={r} k={k} />)}
          <div className="text-[16px] font-extrabold text-primary">{r.overallLabel ?? r.overallBand?.label ?? formatScore(r.overall)}</div>
          <div>
            <span className={`rounded-[8px] px-[9px] py-1 text-[12px] font-extrabold text-[#5b6b82] ${SH.chip}`}>{r.cefrLevel ?? '—'}</span>
          </div>
          <ChevronRight className="size-4 text-muted" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
