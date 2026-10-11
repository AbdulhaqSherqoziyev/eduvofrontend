'use client';

import { RowsSkeleton } from '@/components/shared/skeleton';
import { NmButton } from '@/components/ui/nm-button';
import { useAssignmentLive } from '@/lib/hooks/use-center-exams';
import type { Assignment, CatalogExam, LiveRow } from '@/lib/api/center-exams';
import { phaseOf, PHASE_CHIP } from '../assignment-meta';
import { examErrorText } from '../exam-errors';
import { examShortName, hhmm } from '../exam-meta';
import { SH } from '../tokens';
import { LiveTable } from './live-table';

interface Props {
  assignment: Assignment;
  exam?: CatalogExam;
  extra?: { head: string; cell: (r: LiveRow) => React.ReactNode };
  action?: React.ReactNode;
}

/** Live monitor card — polls §2.8 every 5 s while the window is open. */
export function LivePanel({ assignment: a, exam, extra, action }: Props) {
  const phase = phaseOf(a);
  const live = useAssignmentLive(a.id, phase === 'live');
  const rows = live.data?.rows ?? [];
  const started = rows.filter((r) => r.status !== 'NOT_STARTED').length;
  const finished = rows.filter((r) => r.status === 'COMPLETED').length;
  const chip = PHASE_CHIP[phase];
  return (
    <div className={`min-w-0 rounded-[24px] bg-background p-5 md:p-6 ${SH.card}`}>
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.8px]" style={{ color: chip.fg }}>
            <span
              className={`size-2 rounded-full ${phase === 'live' ? 'animate-pulse' : ''}`}
              style={{ background: chip.fg, boxShadow: `0 0 0 4px ${chip.bg}` }}
            />
            {chip.label} · {hhmm(new Date(a.windowStart))}–{hhmm(new Date(a.windowEnd))}
          </div>
          <div className="mt-2 text-[19px] font-extrabold">
            {a.groupName ?? a.title} · {[examShortName(exam, a.examCode), a.testTitle].filter(Boolean).join(', ')}
          </div>
        </div>
        <div className="flex items-start gap-[18px] text-right">
          <div>
            <div className="text-[22px] font-extrabold">{live.data ? started : a.startedCount}<span className="text-[14px] text-[#9aa6b8]">/{a.studentCount}</span></div>
            <div className="text-[11.5px] font-semibold text-muted">boshladi</div>
          </div>
          <div>
            <div className="text-[22px] font-extrabold">{live.data ? finished : a.completedCount}</div>
            <div className="text-[11.5px] font-semibold text-muted">tugatdi</div>
          </div>
          {action}
        </div>
      </div>
      {live.isLoading ? <RowsSkeleton rows={4} /> : null}
      {live.isError && !live.data ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-[13.5px] font-bold">{examErrorText(live.error, "Jonli ma'lumotni yuklab bo'lmadi.")}</p>
          <NmButton variant="soft" size="sm" onClick={() => live.refetch()}>Qayta urinish</NmButton>
        </div>
      ) : null}
      {live.isError && live.data ? (
        <p className="mb-2 text-[12px] font-bold text-[#B7790F]">Yangilab bo&apos;lmadi — oxirgi ma&apos;lumot ko&apos;rsatilmoqda.</p>
      ) : null}
      {live.data && rows.length === 0 ? (
        <p className="py-8 text-center text-[13.5px] font-semibold text-muted">Bu tayinlovda o&apos;quvchi yo&apos;q.</p>
      ) : null}
      {rows.length ? <LiveTable rows={rows} exam={exam} serverNow={live.data?.serverNow} extra={extra} /> : null}
    </div>
  );
}
