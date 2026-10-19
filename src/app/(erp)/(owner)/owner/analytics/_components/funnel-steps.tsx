'use client';
/** Funnel (spec §6.1) — full list with bars, and the `compact` 3-block mini-funnel of Umumiy (§4.1). */
import { Fragment } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { FunnelResponse, FunnelStep, WebSite } from '@/lib/api/owner-analytics.types';
import { cn } from '@/lib/utils/cn';
import { fmtInt, fmtPct } from './format';
import { Dash, InfoNote } from './states';

export const STEP_LABEL: Record<WebSite, Record<FunnelStep['key'], string>> = {
  landing: { people: 'Kirdi', signupPagePeople: "Ro'yxatdan o'tish sahifasini ochdi", centersCreated: "Ro'yxatdan o'tdi (markaz yaratildi)", signups: '', cohortPayers: '' },
  mock: { people: 'Kirdi', signups: "Ro'yxatdan o'tdi", cohortPayers: "Shulardan to'ladi", signupPagePeople: '', centersCreated: '' },
};
const EXCEEDS = 'Bu qadamga boshqa kunlarda kirganlar ham tushgan.';

function Rate({ step, index }: { step: FunnelStep; index: number }) {
  if (index === 0) return null;
  if (step.exceedsPrev) {
    return (
      <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-muted">
        oldingisidan —
        <span title={EXCEEDS} className="inline-flex cursor-help"><Info className="size-3.5" aria-hidden /><span className="sr-only">{EXCEEDS}</span></span>
      </span>
    );
  }
  if (step.rateFromPrev === null) return <span className="text-[12.5px] font-medium text-muted">oldingisidan <span title="Ma'lumot yo'q">—</span></span>;
  return <span className="text-[12.5px] font-medium text-muted">oldingisidan {fmtPct(step.rateFromPrev)}</span>;
}

const Value = ({ step }: { step: FunnelStep }) =>
  step.value === null ? <span className="text-[22px] font-extrabold"><Dash reason={step.reason} /></span>
    : <span className="text-[22px] font-extrabold leading-none tabular-nums text-foreground">{fmtInt(step.value)}</span>;

/** Umumiy mini-funnel: 3 blocks, ChevronRight between (phone: vertical with ChevronDown). */
export function FunnelCompact({ site, steps }: { site: WebSite; steps: FunnelStep[] }) {
  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:gap-3">
      {steps.map((s, i) => (
        <Fragment key={s.key}>
          {i > 0 ? (
            <div className="flex justify-center text-muted sm:pt-6" aria-hidden>
              <ChevronDown className="size-4 sm:hidden" /><ChevronRight className="hidden size-4 sm:block" />
            </div>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-[14px] bg-background px-3.5 py-3 shadow-nm-inset-sm">
            <span className="text-[12.5px] font-bold text-foreground">{STEP_LABEL[site][s.key]}</span>
            <Value step={s} />
            <Rate step={s} index={i} />
            {site === 'mock' && s.key === 'cohortPayers' ? <span className="text-[11px] font-medium text-muted">shu davrda ro&apos;yxatdan o&apos;tganlardan</span> : null}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** Funnel tab: numbered steps, bars relative to step 1, mock branch row. */
export function FunnelFull({ data }: { data: FunnelResponse }) {
  const { site, steps, branch } = data;
  const base = steps[0]?.value ?? 0;
  const bar = (v: number | null) => (v === null || base <= 0 ? 0 : v > 0 ? Math.max(1.5, (v / base) * 100) : 0);
  const sourceLabel = (s: FunnelStep) =>
    s.source === 'tracker' ? "tashriflar bo'yicha" : site === 'mock' && s.key === 'cohortPayers' ? "baza bo'yicha · shu davrda ro'yxatdan o'tganlardan" : "baza bo'yicha";

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-4">
        {steps.map((s, i) => (
          <Fragment key={s.key}>
            <li className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-1.5">
              <span className="pt-0.5 text-[13px] font-extrabold text-muted">{i + 1}</span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-[13.5px] font-bold text-foreground">{STEP_LABEL[site][s.key]}</span>
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"><Value step={s} /><Rate step={s} index={i} /></span>
                </div>
                <ProgressBar value={bar(s.value)} className="h-[8px]" />
                <span className="text-[11px] font-medium text-muted">{sourceLabel(s)}</span>
              </div>
            </li>
            {branch && s.key === 'signups' ? (
              <li className="grid grid-cols-[24px_1fr] gap-x-3 pl-4">
                <span aria-hidden className="text-muted">└</span>
                {branch.disabledWholePeriod ? (
                  <span className="text-[12.5px] font-medium text-muted">Bepul bo&apos;lim bu davrda o&apos;chirilgan edi</span>
                ) : (
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="text-[13px] font-semibold text-foreground">ulardan bepul bo&apos;limni boshladi</span>
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-[17px] font-extrabold tabular-nums text-foreground">{branch.value === null ? <Dash /> : fmtInt(branch.value)}</span>
                      {branch.rateOfSignups !== null ? <span className="text-[12.5px] font-medium text-muted">ro&apos;yxatdan o&apos;tganlarning {fmtPct(branch.rateOfSignups)}</span> : null}
                    </span>
                  </div>
                )}
              </li>
            ) : null}
          </Fragment>
        ))}
      </ol>
      <InfoNote className={cn('pt-1')}>
        Qadamlar tanlangan davr bo&apos;yicha sanaladi. &quot;Kirdi&quot; — kunlik odamlar yig&apos;indisi, shuning uchun bir necha kun kirgan odam bir necha marta sanaladi.
      </InfoNote>
    </div>
  );
}
