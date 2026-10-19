'use client';
/** Site switch (§2.3) + period picker (§2.4). */
import { useEffect, useState } from 'react';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { TashkentTimeNote } from '@/components/owner/tashkent-time-note';
import type { AnalyticsSiteOrAll } from '@/lib/api/owner-analytics.types';
import { cn } from '@/lib/utils/cn';
import { SITE_LABEL, SITE_SHORT } from './labels';
import { rangeError, useAnalyticsFilters, type RangeKey } from './use-analytics-filters';

const ORDER: AnalyticsSiteOrAll[] = ['landing', 'mock', 'erp', 'all'];

export function SiteSwitch() {
  const { site, setSite } = useAnalyticsFilters();
  const onChange = (v: string) => setSite(v as AnalyticsSiteOrAll);
  return (
    <>
      <NmSegmented size="sm" aria-label="Sayt" className="hidden w-[520px] max-w-full sm:flex"
        items={ORDER.map((s) => ({ value: s, label: SITE_LABEL[s] }))} value={site} onValueChange={onChange} />
      <NmSegmented size="sm" aria-label="Sayt" className="w-full sm:hidden [&>button]:px-2"
        items={ORDER.map((s) => ({ value: s, label: SITE_SHORT[s] }))} value={site} onValueChange={onChange} />
    </>
  );
}

export function PeriodPicker({ disabled }: { disabled?: boolean }) {
  const { range, from, to, today, setRange } = useAnalyticsFilters();
  const [dFrom, setDFrom] = useState(from);
  const [dTo, setDTo] = useState(to);
  useEffect(() => { setDFrom(from); setDTo(to); }, [from, to]);
  const err = rangeError(dFrom, dTo, today);

  const onDate = (f: string, t: string) => {
    setDFrom(f); setDTo(t);
    if (!rangeError(f, t, today)) setRange('custom', f, t);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <fieldset disabled={disabled} className={cn('m-0 flex min-w-0 flex-col gap-3 border-0 p-0 sm:flex-row sm:flex-wrap sm:items-end', disabled ? 'opacity-50' : '')}>
        <legend className="sr-only">Davr</legend>
        <NmSegmented size="sm" aria-label="Davr" className="w-full sm:w-[300px]"
          items={[{ value: 'today', label: 'Bugun' }, { value: '7d', label: '7 kun' }, { value: '30d', label: '30 kun' }]}
          value={range === 'custom' ? '' : range}
          onValueChange={(v) => setRange(v as RangeKey)} />
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
          <div className="min-w-0 sm:w-[170px]">
            <FieldLabel htmlFor="an-from">Dan</FieldLabel>
            <NmInput id="an-from" type="date" value={dFrom} max={dTo || today} onChange={(e) => onDate(e.target.value, dTo)} />
          </div>
          <div className="min-w-0 sm:w-[170px]">
            <FieldLabel htmlFor="an-to">Gacha</FieldLabel>
            <NmInput id="an-to" type="date" value={dTo} min={dFrom} max={today} onChange={(e) => onDate(dFrom, e.target.value)} />
          </div>
        </div>
        {err && !disabled ? <span className="text-[12px] font-semibold text-danger sm:pb-3">{err}</span> : null}
        <TashkentTimeNote className="sm:pb-3" />
      </fieldset>
      {disabled ? <span className="text-[12px] font-medium text-muted">Hozir tabida davr ishlatilmaydi</span> : null}
    </div>
  );
}
