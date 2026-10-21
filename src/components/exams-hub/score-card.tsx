'use client';
/** ScoreCard (§4): neutral ink number, "AI" chip on AI sections, distance line. No "estimated" chip (Abdulhaq 10-12). Never red. */
import { Flag, Hourglass, UserCheck } from 'lucide-react';
import { NmSkeleton } from '@/components/ui/nm-skeleton';
import { cefrTarget } from '@/lib/exam/hub-derive';
import type { ExamFamily } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import type { ResultResp, ResultSection } from '@/lib/exam/types';
import { cn } from '@/lib/utils/cn';

const isAi = (s: ResultSection) => s.key === 'writing' || s.key === 'speaking';

function Distance({ s, family, cert }: { s: ResultSection; family: ExamFamily; cert: ResultResp['certificate'] }) {
  const line = (text: string) => (
    <div className="flex items-start gap-1.5 text-[13px] font-semibold leading-[1.45] text-[#5b6b82]">
      <Flag className="mt-0.5 size-3.5 shrink-0" aria-hidden />{text}
    </div>
  );
  if (s.scaled == null) return null;
  if (family === 'CEFR') {
    const target = cefrTarget(s.scaled, s.nextLevel, cert);
    return (
      <>
        {target ? line(ht('results.cefr_to_next', { n: s.scaled, k: Math.max(0, target.min - s.scaled), level: target.level })) : line(ht('hubx.scale_top'))}
        {cert && s.scaled < cert.min ? <div className="text-[12px] font-semibold text-muted">{ht('results.cefr_cert_note', { min: cert.min })}</div> : null}
      </>
    );
  }
  if (s.raw != null && s.max != null) return s.raw >= s.max ? line(ht('hubx.scale_top')) : line(ht('results.lr_raw', { n: s.raw, total: s.max }));
  return null;
}

function Pending({ s }: { s: ResultSection }) {
  if (s.status === 'NEEDS_HUMAN') {
    return <div className="flex items-start gap-1.5 text-[12.5px] font-semibold text-[#5b6b82]"><UserCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />{ht('results.human_review')}</div>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 self-start rounded-[9px] bg-[#EEE9FF] px-2.5 py-1 text-[12px] font-bold text-[#5B3FD1]">
      <Hourglass className="size-3.5" aria-hidden />{ht(s.key === 'writing' ? 'results.grading_writing' : 'hubx.st_grading')}
    </span>
  );
}

interface Props {
  s: ResultSection;
  family: ExamFamily;
  cert: ResultResp['certificate'];
  selected: boolean;
  onSelect: () => void;
  /** speaking contract §4 status — the card shows "—" + a line while Speaking is pending. */
  speakingStatus?: string;
}

export function ScoreCard({ s, family, cert, selected, onSelect, speakingStatus }: Props) {
  const ready = s.status === 'READY' && s.label != null;
  const grading = s.status === 'GRADING' || s.status === 'NEEDS_HUMAN';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn('flex min-w-0 flex-col gap-2 rounded-[22px] bg-background p-5 text-left shadow-nm', selected && 'ring-2 ring-inset ring-primary')}
    >
      <span className="text-[13px] font-extrabold text-foreground">{s.title}</span>
      {ready ? (
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[44px] font-extrabold leading-none tracking-[-1px] text-[#1E2A3A] tabular-nums max-md:text-[36px]">{s.label}</span>
          {isAi(s) ? <span className="rounded-[7px] bg-[#EEE9FF] px-2 py-0.5 text-[10.5px] font-extrabold text-[#5B3FD1]">{ht('x.ai_badge')}</span> : null}
        </span>
      ) : grading ? (
        <NmSkeleton h={44} className="w-24" />
      ) : (
        <span className="text-[44px] font-extrabold leading-none text-[#9aa6b8] max-md:text-[36px]">—</span>
      )}
      {ready ? <Distance s={s} family={family} cert={cert} /> : null}
      {grading ? <Pending s={s} /> : null}
      {s.key === 'speaking' && speakingStatus === 'pending' ? <div className="text-[12.5px] font-semibold text-muted">{ht('results.speaking_not_taken')}</div> : null}
    </button>
  );
}
