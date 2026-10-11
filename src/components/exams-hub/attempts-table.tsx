'use client';
/** AttemptsTable (§3.5; §5 adds IMTIHON). Phones get a card list (§5 mobile). */
import { Check, Hourglass, PauseCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StatusPill } from '@/components/shared/status-pill';
import { NmButton } from '@/components/ui/nm-button';
import type { AttemptRowState } from '@/lib/exam/hub-derive';
import { dayShortTime } from '@/lib/exam/hub-format';
import { ht } from '@/lib/exam/i18n/hub';
import { cn } from '@/lib/utils/cn';
import { playerUrl, resultUrl } from '@/lib/exam/use-start-attempt';

export interface AttemptRow {
  id: string;
  at: string;
  exam?: string;
  mode: string;
  variant: string | null;
  result: string | null;
  state: AttemptRowState;
}

function Pill({ s }: { s: AttemptRowState }) {
  const I = 'size-3.5';
  if (s === 'ready') return <StatusPill tone="success" icon={<Check className={I} aria-hidden />} label={ht('hubx.st_ready')} />;
  if (s === 'grading') return <StatusPill tone="ai" icon={<Hourglass className={I} aria-hidden />} label={ht('hubx.st_grading')} />;
  return <StatusPill tone="warning" icon={<PauseCircle className={I} aria-hidden />} label={ht('hubx.unfinished')} />;
}

export function AttemptsTable({ rows, withExam, empty }: { rows: AttemptRow[]; withExam?: boolean; empty: React.ReactNode }) {
  const router = useRouter();
  const [all, setAll] = useState(false);
  if (!rows.length) return <div className="text-[13.5px] font-medium leading-[1.6] text-[#5b6b82]">{empty}</div>;
  const list = all ? rows : rows.slice(0, 10);
  const cols = withExam
    ? 'md:grid-cols-[1fr_1.2fr_1fr_1.4fr_auto_110px] xl:grid-cols-[1fr_1.2fr_1fr_.8fr_1.4fr_auto_110px]'
    : 'md:grid-cols-[1fr_1fr_1.4fr_auto_110px] xl:grid-cols-[1fr_1fr_.8fr_1.4fr_auto_110px]';
  const open = (r: AttemptRow) => router.push(r.state === 'unfinished' ? playerUrl(r.id) : resultUrl(r.id));

  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn('hidden gap-3.5 px-3.5 pb-2 text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8] md:grid', cols)}>
        <div>{ht('hubx.th_date')}</div>
        {withExam ? <div>{ht('hubx.th_exam')}</div> : null}
        <div>{ht('hubx.th_mode')}</div>
        <div className="hidden xl:block">{ht('hubx.th_variant')}</div>
        <div>{ht('hubx.th_result')}</div>
        <div>{ht('hubx.th_status')}</div>
        <div />
      </div>
      {list.map((r) => (
        <div key={r.id} className={cn('grid grid-cols-[1fr_auto] items-center gap-x-3.5 gap-y-1.5 rounded-[14px] px-3.5 py-3 text-[13.5px] shadow-nm-inset-sm md:min-h-14 md:py-2', cols)}>
          <div className="font-bold text-foreground tabular-nums">{dayShortTime(r.at)}</div>
          {withExam ? <div className="font-semibold text-[#5b6b82] max-md:hidden">{r.exam}</div> : null}
          <div className="font-semibold text-[#5b6b82] max-md:hidden">{r.mode}</div>
          <div className="hidden font-semibold text-[#5b6b82] xl:block">{r.variant ?? '—'}</div>
          <div className="font-extrabold text-foreground tabular-nums max-md:col-start-1">{r.result ?? '—'}</div>
          <div className="max-md:col-start-2 max-md:row-start-1"><Pill s={r.state} /></div>
          <NmButton variant="ghost" size="sm" className="justify-self-end max-md:col-start-2 max-md:row-start-2" onClick={() => open(r)}>
            {r.state === 'unfinished' ? ht('hubx.continue') : ht('hubx.result')}
          </NmButton>
        </div>
      ))}
      {!all && rows.length > 10 ? (
        <NmButton variant="ghost" className="self-start" onClick={() => setAll(true)}>{ht('hubx.show_more')}</NmButton>
      ) : null}
    </div>
  );
}
