'use client';
/** Result `/exams/attempts/[id]/result` (§4): player results structure in the v3 shell. */
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { dayLong, examTitle, hm } from '@/lib/exam/hub-format';
import type { ExamFamily } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { resultFacts } from '@/lib/exam/result-facts';
import { errCode } from '@/lib/exam/hub-api';
import { useExamDetail, useHubNow, useResult } from '@/lib/exam/use-hub';
import { assignmentPhase } from '@/lib/exam/hub-derive';
import { playerUrl } from '@/lib/exam/use-start-attempt';
import { AiTaskPanel } from './ai-task-panel';
import { Delayed, HubError, SkeletonBlock } from './hub-states';
import { GradingStrip, ResultHero } from './result-hero';
import { ReviewPanel } from './review-panel';
import { ScoreCard } from './score-card';

const familyOf = (code: string): ExamFamily => (code.split('_')[0] as ExamFamily) ?? 'IELTS';

function ResultSkeleton() {
  return (
    <Delayed>
      <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
        <SkeletonBlock h={180} className="rounded-[24px] !bg-[#2A3850]" />
        <div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <SkeletonBlock key={i} h={150} className="rounded-[22px]" />)}</div>
      </div>
    </Delayed>
  );
}

export function ResultView({ id }: { id: string }) {
  const q = useResult(id);
  const now = useHubNow();
  const detail = useExamDetail(q.data?.examCode ?? '', !!q.data);
  const router = useRouter();
  const type = useSearchParams().get('type');
  const [sel, setSel] = useState<string | null>(null);
  const unfinished = errCode(q.error) === 'ATTEMPT_NOT_FINISHED';
  useEffect(() => {
    if (unfinished) router.replace(playerUrl(id));
  }, [unfinished, id, router]);
  // "Shu savollarni ko'rish" from Natijalarim opens the section that holds that question type.
  const typeSection = type ? q.data?.review.find((x) => x.type === type)?.sectionKey ?? null : null;

  if (q.isLoading || unfinished) return <ResultSkeleton />;
  if (q.isError || !q.data) return <HubError error={q.error} onRetry={() => void q.refetch()} />;
  const r = q.data;
  const d = detail.data;
  const family = d?.exam.family ?? familyOf(r.examCode);
  const facts = resultFacts(r, d, family);
  const att = d?.attempts.find((a) => a.id === id);
  const variant = att ? d?.tests.find((t) => t.id === att.testId)?.title : null;
  const sections = r.sections.filter((s) => s.status !== 'NOT_TAKEN');
  const cur = sections.find((s) => s.key === (sel ?? typeSection)) ?? sections[0];
  const name = examTitle(r.examName ?? r.examCode);
  const when = att?.finishedAt ?? att?.startedAt;
  const sub = [`${name} — ${sections.map((s) => s.title).join(', ')}`, when ? `${dayLong(when)}, ${hm(when)}` : null, variant ? ht('hubx.variant_line', { v: variant }) : null].filter(Boolean).join(' · ');
  // Primary "Yana bir mock" only when an assignment is open right now; otherwise a soft way back.
  const hasOpen = !!d?.assignments.some((a) => assignmentPhase(a, now) === 'open');
  const another = hasOpen ? (
    <Link href={`/exams/${encodeURIComponent(r.examCode)}`} className="flex h-[46px] items-center justify-center rounded-ctl bg-grad-primary px-5 text-[14px] font-bold text-white shadow-nm-primary max-md:w-full">
      {ht('chrome.take_another_mock')}
    </Link>
  ) : (
    <Link href="/exams" className="flex h-[46px] items-center justify-center rounded-ctl bg-background px-5 text-[14px] font-bold text-primary shadow-nm-sm nm-pressable max-md:w-full">
      {ht('hubx.back_to_exams')}
    </Link>
  );

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/exams/${encodeURIComponent(r.examCode)}`} className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#5b6b82] hover:text-primary">
            <ArrowLeft className="size-4" aria-hidden />{name}
          </Link>
          <h1 className="mt-2 text-[26px] font-extrabold tracking-[-0.5px] text-foreground max-md:text-[22px]">
            {ht('hubx.your_result')}{facts.mockN ? ` · ${ht('results.mock_n', { n: facts.mockN })}` : ''}
          </h1>
          <div className="mt-1 text-[13px] font-semibold text-muted">{sub}</div>
        </div>
        <div className="max-md:hidden">{another}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
        <ResultHero r={r} facts={facts} />
        <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {sections.map((s) => (
            <ScoreCard key={s.key} s={s} family={family} cert={r.certificate} selected={s.key === cur?.key} onSelect={() => setSel(s.key)} />
          ))}
        </div>
      </div>
      <GradingStrip r={r} />

      {sections.length > 1 ? (
        <div className="-mx-1 overflow-x-auto px-1 py-1">
          <NmSegmented size="sm" className="min-w-[360px] md:w-[420px]" value={cur?.key ?? ''} onValueChange={setSel} items={sections.map((s) => ({ value: s.key, label: s.title }))} />
        </div>
      ) : null}
      {cur && (cur.key === 'writing' || cur.key === 'speaking') ? <AiTaskPanel r={r} family={family} /> : null}
      {cur && cur.key !== 'writing' && cur.key !== 'speaking' ? (
        cur.status === 'READY' ? <ReviewPanel r={r} s={cur} /> : <NmCard className="p-6 text-[14px] font-semibold text-muted">—</NmCard>
      ) : null}
      <div className="md:hidden">{another}</div>
    </>
  );
}
