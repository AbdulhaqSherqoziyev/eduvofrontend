'use client';

import { NmSwitch } from '@/components/ui/nm-switch';
import { monthFromDay, monthName } from '@/lib/utils/payroll-labels';
import type { CompensationView } from '@/lib/types/payroll';

interface EffectiveFromNoteProps {
  view: CompensationView;
  thisMonth: boolean;
  onChange: (thisMonth: boolean) => void;
  disabled?: boolean;
}

/**
 * Qoida qachondan kuchga kiradi (§A.6) — maydon emas, bitta qator + switch.
 *
 * DEFAULT KEYINGI OYDAN [SV3]. Oyning 20-kunida foiz o'zgarsa, ustoz oy
 * boshidan beri kuzatib kelgan oraliq raqam JIMGINA o'zgaradi — va bu yerdagi
 * xavf raqamning noto'g'riligi emas, o'zgarganini hech kim aytmasligi.
 * Keyingi oydan boshlash bu holatni butunlay yo'q qiladi; "shu oydan" esa bir
 * bosish narida qoladi, oqibati yozilgan holda.
 */
export function EffectiveFromNote({ view, thisMonth, onChange, disabled }: EffectiveFromNoteProps) {
  const next = monthFromDay(view.defaultEffectiveFromPeriod);
  const current = monthName(view.currentPeriod);
  const frozen = view.currentPeriodStatus === 'APPROVED' || view.currentPeriodStatus === 'PAID';

  if (frozen) {
    return (
      <p className="text-[11.5px] font-medium leading-[1.45] text-muted">
        {current} hisobi tasdiqlangan — qoida {next} kuchga kiradi.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11.5px] font-medium leading-[1.45] text-muted">
        {thisMonth
          ? `Qoida ${monthFromDay(view.currentPeriod)} qo'llanadi — ${current.toLowerCase()} hisobi qayta hisoblanadi va xodim ekranidagi raqam o'zgaradi.`
          : `Qoida ${next} kuchga kiradi. ${current} hisobi o'zgarmaydi.`}
        {view.rule ? " Oldingi oylarning hisobi o'zgarmaydi." : ''}
      </p>
      <label className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-semibold text-foreground">Shu oydan boshlab qo&apos;llash</span>
        <NmSwitch
          checked={thisMonth}
          disabled={disabled}
          aria-label="Shu oydan boshlab qo'llash"
          onCheckedChange={onChange}
        />
      </label>
    </div>
  );
}
