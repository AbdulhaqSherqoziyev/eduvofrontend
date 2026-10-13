'use client';

import { cn } from '@/lib/utils/cn';

export type BankTab = 'tests' | 'tables';
const TABS: { key: BankTab; label: string }[] = [{ key: 'tests', label: 'Testlar' }, { key: 'tables', label: 'Aylantirish jadvallari' }];

/** v3 inset tab strip (36px buttons, active = raised + primary text). */
export function BankTabs({ value, onChange }: { value: BankTab; onChange: (t: BankTab) => void }) {
  return (
    <div role="tablist" className="flex w-max gap-1.5 rounded-[15px] bg-background p-[5px] shadow-nm-inset">
      {TABS.map((t) => (
        <button key={t.key} type="button" role="tab" aria-selected={value === t.key} onClick={() => onChange(t.key)}
          className={cn('h-9 rounded-[11px] bg-background px-4 text-[13.5px] font-bold', value === t.key ? 'text-primary shadow-nm-sm' : 'text-muted')}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
