'use client';
/** FormatTable (§3.1, v3 grid). v1: no per-section start (assigned only) — Speaking shows "Tez orada". */
import { Clock } from 'lucide-react';
import { StatusPill } from '@/components/shared/status-pill';
import { sectionTime } from '@/lib/exam/hub-format';
import type { HubExam, HubSection } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { cn } from '@/lib/utils/cn';

const COLS = 'grid grid-cols-[1.6fr_.7fr_1.2fr_1fr] gap-3.5 max-md:grid-cols-[1fr_auto]';

function content(e: Pick<HubExam, 'family'>, s: HubSection): string {
  const b = s.brief;
  if (b.tasks) return ht('hubx.tasks_n', { n: b.tasks });
  if (!b.questions) return '—';
  const base = b.parts ? ht('hubx.parts_questions', { p: b.parts, q: b.questions }) : ht('hubx.questions_only', { q: b.questions });
  if (s.key !== 'listening') return base;
  return `${base} · ${ht(e.family === 'CEFR' ? 'hubx.audio_twice' : 'hubx.audio_once')}`;
}

function Badge({ ai }: { ai: boolean }) {
  return (
    <span className={cn('rounded-[7px] px-2 py-1 text-[11px] font-extrabold tracking-[0.4px]', ai ? 'bg-[#EEE9FF] text-[#5B3FD1]' : 'bg-[#E5F5EE] text-[#1F7A55]')}>
      {ai ? 'AI' : 'AUTO'}
    </span>
  );
}

export function FormatTable({ exam }: { exam: Pick<HubExam, 'family' | 'sections'> }) {
  return (
    <div>
      <div className={cn(COLS, 'px-3.5 pb-2.5 text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8] max-md:hidden')}>
        <div>{ht('hubx.col_section')}</div>
        <div>{ht('hubx.col_time')}</div>
        <div>{ht('hubx.col_content')}</div>
        <div>{ht('hubx.col_grading')}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        {exam.sections.map((s) => {
          const soon = !s.available;
          return (
            <div key={s.key} className={cn(COLS, 'items-center rounded-[14px] px-3.5 py-3 text-[13.5px] shadow-nm-inset-sm', soon && 'opacity-60')}>
              <div className="font-extrabold text-foreground">{s.title}</div>
              {soon ? (
                <div className="md:col-span-3">
                  <StatusPill tone="muted" icon={<Clock className="size-3.5" aria-hidden />} label={ht('hubx.speaking_soon')} />
                </div>
              ) : (
                <>
                  <div className="font-bold text-[#5b6b82] tabular-nums">{sectionTime(s) ?? '—'}</div>
                  <div className="font-semibold text-[#5b6b82] max-md:col-span-2">{content(exam, s)}</div>
                  <div className="max-md:col-span-2"><Badge ai={s.gradingKind !== 'objective'} /></div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
