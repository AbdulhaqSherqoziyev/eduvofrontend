'use client';
/** Detail left card (§3.1): title, description, CEFR trainer note, FormatTable, sample question. */
import { Info } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { durationLabel, examTitle, formatChip, sectionList, totalSec } from '@/lib/exam/hub-format';
import type { HubExam } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { ExamTile } from './exam-card';
import { FormatTable } from './format-table';
import { SampleQuestion } from './sample-question';

export function DetailHead({ exam }: { exam: HubExam }) {
  const total = totalSec(exam);
  return (
    <div className="flex items-center gap-4">
      <ExamTile exam={exam} size={60} />
      <div className="min-w-0">
        <h1 className="text-[21px] font-extrabold tracking-[-0.4px] text-foreground">
          {examTitle(exam.name)} — {sectionList(exam)}
        </h1>
        <div className="mt-1 text-[13px] font-semibold text-muted">
          {formatChip(exam.family)}
          {total != null ? ` · ${durationLabel(total)}` : ''}
        </div>
      </div>
    </div>
  );
}

export function DetailMain({ exam }: { exam: HubExam }) {
  return (
    <NmCard className="flex min-w-0 flex-col gap-5 rounded-[24px] p-[26px] max-md:p-5">
      <DetailHead exam={exam} />
      {exam.family === 'IELTS' ? (
        <p className="max-w-[720px] text-[14px] font-medium leading-[1.6] text-[#5b6b82]">{ht('hubx.desc_ielts')}</p>
      ) : null}
      {exam.family === 'CEFR' ? (
        <div className="flex gap-2.5 rounded-[16px] px-4 py-3.5 shadow-nm-inset-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <p className="text-[13.5px] font-medium leading-[1.55] text-[#5b6b82]">{ht('hubx.cefr_trainer')}</p>
        </div>
      ) : null}
      <FormatTable exam={exam} />
      <SampleQuestion family={exam.family} />
    </NmCard>
  );
}
