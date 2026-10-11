'use client';

import { useQuery } from '@tanstack/react-query';
import { centerExamsApi } from '@/lib/api/center-exams';
import { useExamPreview } from '@/lib/hooks/use-center-exams';
import { useExamCredits, useGradingStats } from '@/lib/hooks/use-center-exams-v3';
import { can } from '@/lib/auth/permissions';
import { moduleOn } from '@/lib/auth/module-gate';
import { SH } from './tokens';

type Badge = { count: number; color: string };

/** Sidebar badges (design v3): green = live + upcoming sessions, purple = AI grading queue. */
export function useExamNavBadges(enabled: boolean): Record<'examSessions' | 'examGrading', Badge> {
  const on = enabled && moduleOn('mock_exams') && can('exam.read');
  const sessions = useQuery({
    queryKey: ['center-exams', 'nav-badge'],
    queryFn: async () => {
      const [a, u] = await Promise.all([
        centerExamsApi.assignments({ status: 'active', limit: 1 }),
        centerExamsApi.assignments({ status: 'upcoming', limit: 1 }),
      ]);
      return a.total + u.total;
    },
    enabled: on,
    staleTime: 60_000,
    retry: false,
  });
  const grading = useGradingStats(on);
  return {
    examSessions: { count: sessions.data ?? 0, color: '#1F9D6B' },
    examGrading: { count: grading.data?.pending ?? 0, color: '#5B3FD1' },
  };
}

/** Header "KREDIT {n} kr" pill (design v3 shell) — shown in the Imtihonlar section. */
export function ExamCreditsPill() {
  const q = useExamCredits();
  if (q.isError) return null;
  return (
    <div className={`flex h-11 flex-shrink-0 flex-col items-end justify-center rounded-[13px] bg-background px-4 ${SH.btn}`}>
      <div className="text-[9.5px] font-bold tracking-[0.8px] text-[#9aa6b8]">KREDIT</div>
      <div className="text-[15px] font-extrabold leading-tight text-primary">{q.data ? `${q.data.credits} kr` : '—'}</div>
    </div>
  );
}

/** Design prefers the IELTS full mock for "O'quvchi ko'rinishi". */
const PREFERRED = ['IELTS_ACADEMIC', 'CEFR_MULTILEVEL_EN'];

/**
 * Sidebar footer of the Imtihonlar section: divider + "O'quvchi ko'rinishi ↗"
 * — opens the newest published test as a free preview attempt in a new tab.
 */
export function ExamsNavExtras() {
  const preview = useExamPreview();
  const tests = useQuery({
    queryKey: ['center-exams', 'tests', 'all'],
    queryFn: () => centerExamsApi.tests(),
    enabled: can('exam.read') && moduleOn('mock_exams'),
    staleTime: 60_000,
  });
  const items = tests.data ?? [];
  const pick = PREFERRED.map((c) => items.find((t) => t.examCode === c)).find(Boolean) ?? items[0];
  const disabled = !pick || preview.isPending;
  return (
    <>
      <div className="mx-1.5 my-3 h-[1.5px] bg-[rgba(163,177,198,0.28)] dark:bg-[rgba(255,255,255,0.06)]" />
      <button
        type="button"
        disabled={disabled}
        title={pick ? undefined : "Nashr qilingan test yo'q"}
        onClick={() => pick && preview.open(pick.id)}
        className="flex w-full items-center gap-3 rounded-[15px] px-[14px] py-3 text-left text-[14.5px] font-semibold text-muted transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-muted"
      >
        {preview.isPending ? 'Ochilmoqda…' : "O'quvchi ko'rinishi ↗"}
      </button>
      {preview.error ? (
        <p className="px-[14px] text-[11.5px] font-semibold text-danger">Ko&apos;rinishni ochib bo&apos;lmadi</p>
      ) : null}
    </>
  );
}
