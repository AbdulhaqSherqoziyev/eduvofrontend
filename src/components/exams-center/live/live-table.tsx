'use client';

import type { CatalogExam, LiveRow } from '@/lib/api/center-exams';
import { integrityTitle, liveStatusText, STALE_MS } from '../assignment-meta';
import { dateTimeLabel, sectionTitle } from '../exam-meta';
import { SH } from '../tokens';
import { Caps, ThinBar } from '../ui';

interface Props {
  rows: LiveRow[];
  exam?: CatalogExam;
  serverNow?: string;
  /** Optional trailing column (detail page: access code actions). */
  extra?: { head: string; cell: (r: LiveRow) => React.ReactNode };
}

/** O'QUVCHI / BO'LIM / JARAYON / OGOHLANTIRISH (design v3 live monitor). */
export function LiveTable({ rows, exam, serverNow, extra }: Props) {
  const cols = extra
    ? 'grid-cols-[1.6fr_1fr_1.6fr_0.8fr_1fr] min-w-[720px]'
    : 'grid-cols-[1.6fr_1fr_1.6fr_0.8fr] min-w-[560px]';
  const now = serverNow ? new Date(serverNow).getTime() : Date.now();
  return (
    <div className="overflow-x-auto">
      <Caps className={`grid ${cols} gap-3.5 px-3 pb-2.5`}>
        <div>O&apos;QUVCHI</div><div>BO&apos;LIM</div><div>JARAYON</div><div className="text-right">OGOHLANTIRISH</div>
        {extra ? <div className="text-right">{extra.head}</div> : null}
      </Caps>
      {rows.map((r) => {
        const done = r.status === 'COMPLETED';
        const stale = r.status === 'ACTIVE' && r.lastSeenAt && now - new Date(r.lastSeenAt).getTime() > STALE_MS;
        const sec = liveStatusText(r) ?? sectionTitle(exam, r.currentSectionKey ?? r.currentStageKey);
        return (
          <div key={r.studentId} className={`mb-1.5 grid ${cols} items-center gap-3.5 rounded-[14px] px-3 py-[11px] ${SH.row}`}>
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold">{r.fullName}</div>
              {stale ? (
                <div className="text-[11px] font-bold text-[#B7790F]" title={`Oxirgi aloqa: ${dateTimeLabel(r.lastSeenAt)}`}>
                  Aloqa yo&apos;q · {dateTimeLabel(r.lastSeenAt).split(', ')[1]}
                </div>
              ) : null}
            </div>
            <div className="truncate text-[12.5px] font-bold text-[#5b6b82]">{sec || '—'}</div>
            {r.status === 'NOT_STARTED' ? (
              <div className="text-[12.5px] font-bold text-[#9aa6b8]">—</div>
            ) : (
              <div className="flex items-center gap-2.5" title={r.totalQuestions ? `${r.answeredCount}/${r.totalQuestions} savol` : undefined}>
                <ThinBar pct={done ? 100 : r.progressPct} color={done ? '#1F9D6B' : '#2E6BE6'} />
                <span className="w-[38px] text-[12px] font-bold text-muted">{done ? 100 : r.progressPct}%</span>
              </div>
            )}
            <div
              className={`text-right text-[12.5px] font-extrabold ${r.integrityCount ? 'text-[#D68A1A]' : 'text-[#9aa6b8]'}`}
              title={r.integrityCount ? integrityTitle(r.integrityCount) : undefined}
            >
              {r.integrityCount ? `${r.integrityCount} tab` : '—'}
            </div>
            {extra ? <div className="flex justify-end">{extra.cell(r)}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
