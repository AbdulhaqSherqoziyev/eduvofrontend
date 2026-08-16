'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import type { PeriodView } from '@/lib/types/payroll';

/**
 * Qoidasi yo'q xodimlar chizig'i (§E.6).
 *
 * `ring-primary` — OGOHLANTIRISH RANGI EMAS: qoidasiz xodim xato emas (tashqi
 * soatbay o'qituvchi bo'lishi mumkin). Bu §A.1 dagi "blok qayerda?" muammosining
 * yechimi: o'qituvchilar jadvaliga maosh ustuni qaytmaydi, o'rniga "kimga
 * sozlanmagan" savoliga shu chiziq javob beradi.
 */
export function MissingRulesStrip({ items }: { items: PeriodView['missingRules'] }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;

  return (
    <NmCard className="px-4 py-3 ring-1 ring-primary/25">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12.5px] font-semibold text-foreground">
          {items.length} xodimga ish haqi qoidasi sozlanmagan — ular hisobga kirmaydi.
        </span>
        <NmButton variant="soft" size="sm" onClick={() => setOpen(!open)}>
          {open ? 'Yopish' : "Ko'rish"}
        </NmButton>
      </div>

      {open ? (
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={`${item.subjectType}-${item.subjectId}`}
              className="flex min-h-[44px] items-center justify-between gap-3 rounded-ctl bg-background px-3 shadow-nm-inset-sm"
            >
              <span className="truncate text-[13px] font-semibold text-foreground">{item.name}</span>
              <Link
                href={item.subjectType === 'TEACHER' ? '/teachers' : '/staff'}
                className="shrink-0 text-[12.5px] font-bold text-primary"
              >
                Sozlash
              </Link>
            </div>
          ))}
        </div>
      ) : null}
    </NmCard>
  );
}
