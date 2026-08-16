'use client';

import { NmCard } from '@/components/ui/nm-card';
import { AmountRow } from '@/components/payroll/amount-row';
import { somOrDash } from '@/lib/utils/payroll-labels';
import type { MyPayrollView } from '@/lib/types/payroll';

interface GroupListProps {
  me: MyPayrollView;
  onOpenGroup: (groupId: string, groupName: string) => void;
}

/**
 * Guruhlar kesimi (§C.6).
 *
 * TARTIB — ALIFBO BO'YICHA [S5.1]. Summa bo'yicha tartiblash guruhlar
 * reytingini yasaydi, reyting esa bu blokda hech kimga ko'rsatilmaydi —
 * ustozning o'z guruhlari orasida ham.
 */
export function GroupList({ me, onOpenGroup }: GroupListProps) {
  if (!me.groups.length) {
    return (
      <NmCard className="p-[22px]">
        <div className="text-[15px] font-bold text-foreground">Sizga hali guruh biriktirilmagan</div>
        <p className="mt-1.5 text-[12.5px] font-medium text-muted">
          Guruh biriktirilgach, to&apos;lovlar shu yerda ko&apos;rinadi.
        </p>
      </NmCard>
    );
  }

  const sorted = [...me.groups].sort((a, b) => a.name.localeCompare(b.name, 'uz'));

  return (
    <NmCard className="p-[22px]">
      <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">Guruhlaringiz</div>
      <p className="mb-2 mt-1 text-[11.5px] font-medium text-muted">
        Summalar — guruhga tushgan pul. Sizning ulushingiz yuqorida hisoblangan.
      </p>
      {sorted.map((g) => (
        <AmountRow
          key={g.id}
          label={`${g.name} · ${g.studentCount} o'quvchi`}
          value={somOrDash(g.collected)}
          hint={g.collected ? null : "To'lov hali tushmagan."}
          onClick={g.collected ? () => onOpenGroup(g.id, g.name) : undefined}
        />
      ))}
    </NmCard>
  );
}
