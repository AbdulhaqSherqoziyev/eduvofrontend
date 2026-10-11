'use client';

import { NmInput } from '@/components/ui/nm-input';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { FieldLabel } from '@/components/ui/label';
import { isoDay } from '@/lib/utils/tx-display';

/** Segment value that reveals the free date range. */
export const CUSTOM_PERIOD = 'custom';

const PERIODS = [
  { value: '3', label: '3 oy' },
  { value: '6', label: '6 oy' },
  { value: '12', label: '12 oy' },
  { value: CUSTOM_PERIOD, label: 'Boshqa' },
];

export interface DateRange {
  from: string;
  to: string;
}

/** 1st of the month three months back → today, in local time. */
export function defaultRange(now = new Date()): DateRange {
  return { from: isoDay(new Date(now.getFullYear(), now.getMonth() - 3, 1)), to: isoDay(now) };
}

/**
 * Why the range cannot be sent, or null when it can. A half-typed range (one
 * side empty) is silent — there is nothing to complain about yet.
 */
export function rangeIssue({ from, to }: DateRange): string | null {
  if (!from || !to) return null;
  if (from > to) return "Boshlanish sanasi tugashdan keyin bo'lmasin";
  const [y, m, d] = from.split('-').map(Number);
  if (to > isoDay(new Date(y, m - 1 + 24, d))) return "Eng ko'pi 24 oy";
  return null;
}

/** Complete and within the backend's limits — safe to put on the wire. */
export function rangeSendable(range: DateRange): boolean {
  return !!range.from && !!range.to && rangeIssue(range) === null;
}

interface RangeFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function RangeField({ id, label, value, onChange }: RangeFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <FieldLabel htmlFor={id} className="mb-0 shrink-0">
        {label}
      </FieldLabel>
      <NmInput id={id} type="date" className="w-[160px]" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

interface FinancePeriodProps {
  period: string;
  onPeriodChange: (value: string) => void;
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
}

/**
 * 3 / 6 / 12 oy presets plus "Boshqa", which opens Dan / Gacha date fields —
 * beside the segmented on wide screens, under it on a phone. The segmented
 * comes first in the DOM (tab order) and stays pinned to the right edge via
 * row-reverse, so revealing the fields never moves the control just pressed.
 * The fields wrap on their own at 360px; the note sits under them.
 */
export function FinancePeriod({ period, onPeriodChange, range, onRangeChange }: FinancePeriodProps) {
  const custom = period === CUSTOM_PERIOD;
  const issue = custom ? rangeIssue(range) : null;

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:items-start">
      <NmSegmented items={PERIODS} value={period} onValueChange={onPeriodChange} className="md:w-[340px]" />
      {custom ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <RangeField id="finance-from" label="Dan" value={range.from} onChange={(from) => onRangeChange({ ...range, from })} />
            <RangeField id="finance-to" label="Gacha" value={range.to} onChange={(to) => onRangeChange({ ...range, to })} />
          </div>
          {issue ? <div className="text-[11.5px] font-semibold text-danger">{issue}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
