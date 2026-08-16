'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { currentPeriod, monthLabel, shiftPeriod } from '@/lib/utils/payroll-labels';

interface PeriodSwitchProps {
  period: string;
  onChange: (period: string) => void;
  /** O'ng tomonda turadigan yorliq (holat pill'i yoki davr amallari). */
  children?: React.ReactNode;
}

/**
 * Davr o'tkazgich (§C.3, §E.2).
 *
 * Kelajak oy `disabled`: hali bo'lmagan oyning hisobini ochish "nol" ni
 * ko'rsatadi, nol esa bu blokda javob emas (§0.5).
 */
export function PeriodSwitch({ period, onChange, children }: PeriodSwitchProps) {
  const atCurrent = period >= currentPeriod();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <NmIconButton aria-label="Oldingi oy" onClick={() => onChange(shiftPeriod(period, -1))}>
          <ChevronLeft className="size-[16px]" strokeWidth={2.2} />
        </NmIconButton>
        <span className="min-w-[130px] text-center text-[15px] font-extrabold tracking-[-0.3px] text-foreground">
          {monthLabel(period)}
        </span>
        <NmIconButton
          aria-label="Keyingi oy"
          disabled={atCurrent}
          onClick={() => onChange(shiftPeriod(period, 1))}
        >
          <ChevronRight className="size-[16px]" strokeWidth={2.2} />
        </NmIconButton>
      </div>
      {children}
    </div>
  );
}
