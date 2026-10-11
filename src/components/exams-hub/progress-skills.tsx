'use client';
/** Ko'nikmalar + "Qayta ko'rish kerak bo'lgan savol turlari" (§5). A drop gets no chip at all. */
import { Minus, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { typeLabel, weakTypes } from '@/lib/exam/hub-derive';
import { scoreText } from '@/lib/exam/hub-format';
import type { ExamFamily } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import type { SkillRow } from '@/lib/exam/progress-derive';
import { useResults } from '@/lib/exam/use-hub';
import { resultUrl } from '@/lib/exam/use-start-attempt';
import { SkeletonBlock } from './hub-states';

export function SkillsCard({ skills, family }: { skills: SkillRow[]; family: ExamFamily }) {
  return (
    <NmCard className="flex flex-col gap-3 rounded-[24px] p-6 max-md:p-4">
      <h2 className="text-[17px] font-extrabold text-foreground">{ht('hubx.skills')}</h2>
      {skills.map((s) => (
        <div key={s.key} className="flex flex-wrap items-center gap-2 rounded-[14px] px-3.5 py-3 shadow-nm-inset-sm">
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-extrabold text-foreground">{s.title}</div>
            <div className="text-[13px] font-semibold text-[#5b6b82] tabular-nums">{ht('hubx.skill_line', { last: s.last, best: s.best })}</div>
          </div>
          {s.delta != null && s.delta > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-[9px] bg-[#E5F5EE] px-2 py-1 text-[12px] font-bold text-[#1F7A55]">
              <TrendingUp className="size-3.5" aria-hidden />+{scoreText(family, s.delta)}
            </span>
          ) : s.delta === 0 ? (
            <span className="inline-flex items-center gap-1 rounded-[9px] bg-[#DDE3EC] px-2 py-1 text-[12px] font-bold text-[#5b6b82]">
              <Minus className="size-3.5" aria-hidden />{ht('hubx.unchanged')}
            </span>
          ) : null}
        </div>
      ))}
    </NmCard>
  );
}

/** Question types across the last 3 mocks (from their result reviews); ≥ 6 questions per type. */
export function WeakTypesCard({ attemptIds }: { attemptIds: string[] }) {
  const router = useRouter();
  const recent = attemptIds.slice(-3);
  const qs = useResults(recent);
  const loading = qs.some((q) => q.isLoading);
  const rows = qs.flatMap((q, i) => (q.data?.review ?? []).map((r) => ({ ...r, attemptId: recent[i]! })));
  const weak = weakTypes(rows, 6, 5);
  const lastWith = (type: string) => [...rows].reverse().find((r) => r.type === type && !r.isCorrect)?.attemptId;

  return (
    <NmCard className="flex flex-col gap-3 rounded-[24px] p-6 max-md:p-4">
      <h2 className="text-[17px] font-extrabold text-foreground">{ht('hubx.weak_title')}</h2>
      {loading ? <SkeletonBlock h={120} className="rounded-[16px]" /> : null}
      {!loading && !weak.length ? <p className="text-[13.5px] font-medium text-[#5b6b82]">{ht('hubx.weak_empty')}</p> : null}
      {!loading && weak.map((w) => {
        const target = lastWith(w.type);
        return (
          <div key={w.type} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {w.correct ? (
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold text-foreground">{typeLabel(w.type)}</div>
                  <div className="text-[12.5px] font-semibold text-muted">{ht('hubx.weak_line', { n: w.correct, total: w.total, m: recent.length })}</div>
                </div>
              ) : (
                <div className="min-w-0 flex-1 text-[13.5px] font-bold text-foreground">{ht('hubx.type_zero', { type: typeLabel(w.type), total: w.total })}</div>
              )}
              {target ? (
                <NmButton variant="ghost" size="sm" onClick={() => router.push(`${resultUrl(target)}?type=${encodeURIComponent(w.type)}`)}>
                  {ht('hub.weak_type_review')}
                </NmButton>
              ) : null}
            </div>
            {w.correct ? (
              <div className="h-1.5 overflow-hidden rounded-[3px] bg-[#DDE3EC]">
                <div className="h-full rounded-[3px] bg-primary" style={{ width: `${(w.correct / w.total) * 100}%` }} />
              </div>
            ) : null}
          </div>
        );
      })}
    </NmCard>
  );
}
