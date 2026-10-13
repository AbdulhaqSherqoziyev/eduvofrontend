'use client';

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatSom } from '@/lib/utils/format';
import { somToWords } from '@/lib/utils/som-to-words';

export interface SummaryRow {
  label: string;
  value: string;
}

interface EntrySummaryStepProps {
  /** "CHIQIM · IJARA" — direction and category in one uppercase line. */
  heading: string;
  sign: '+' | '−';
  amount: number;
  rows: SummaryRow[];
  /** Shown when the entry will queue for approval instead of leaving now. */
  notice?: string;
}

/**
 * §B.4 — the step between typing and writing.
 *
 * It answers Sevara's three questions before the money moves: WHO is writing
 * it, HOW MUCH (large, and spelled out), and WHICH drawer it leaves. The
 * amount is `text-foreground`, not red: this is a confirmation, not a warning,
 * and the size plus the words already hold the attention that red would only
 * turn into pressure [SV1].
 */
export function EntrySummaryStep({ heading, sign, amount, rows, notice }: EntrySummaryStepProps) {
  const Icon = sign === '+' ? ArrowDownLeft : ArrowUpRight;
  const words = somToWords(amount);
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-ctl bg-background p-4 text-center shadow-nm-inset-sm">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.9px] text-muted">
          <Icon className="size-[13px]" />
          {heading}
        </div>
        <div className="mt-2 text-[26px] font-extrabold leading-none tracking-[-0.6px] text-foreground">
          {sign} {formatSom(amount)}
        </div>
        {words ? <div className="mt-2 text-[12px] font-medium text-muted">{words} so&apos;m</div> : null}
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-4 text-[13px]">
            <span className="shrink-0 font-medium text-muted">{r.label}</span>
            <span className="text-right font-bold text-foreground">{r.value || '—'}</span>
          </div>
        ))}
      </div>

      {notice ? (
        <div className="rounded-ctl bg-background p-3 text-[11.5px] font-medium text-foreground shadow-nm-inset-sm">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
