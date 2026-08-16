'use client';

import { useMemo, useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';
import type { PeriodLineView } from '@/lib/types/payroll';
import { PayrollCard } from './payroll-card';
import { PAYROLL_GRID, PayrollRow } from './payroll-row';

interface PayrollTableProps {
  lines: PeriodLineView[];
  busy: boolean;
  onOpen: (line: PeriodLineView) => void;
}

/**
 * Xodimlar jadvali (§E.4).
 *
 * DEFAULT TARTIB — ALIFBO [S5.1]: summa bo'yicha tartiblangan ro'yxat eksport
 * qilinsa yoki ekranda ko'rsatilsa, u xodimlar taqqoslashiga aylanadi va bu
 * blokda reyting hech kimga ko'rsatilmaydi. `JAMI` bo'yicha tartiblash bor,
 * lekin uni direktor o'zi so'raydi.
 */
export function PayrollTable({ lines, busy, onOpen }: PayrollTableProps) {
  const [byTotal, setByTotal] = useState(false);

  const sorted = useMemo(() => {
    const rows = [...lines];
    return byTotal
      ? rows.sort((a, b) => b.total - a.total)
      : rows.sort((a, b) => a.subjectName.localeCompare(b.subjectName, 'uz'));
  }, [lines, byTotal]);

  return (
    <NmCard className={cn('p-[18px] transition-opacity', busy && 'opacity-60')}>
      <div className="hidden md:block">
        <div className={`${PAYROLL_GRID} px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.7px] text-muted`}>
          <span>№</span>
          <span>Xodim</span>
          <span className="hidden text-right xl:block">Asosiy</span>
          <span className="hidden text-right xl:block">Ulush</span>
          <span className="hidden text-right xl:block">Qo&apos;shimcha</span>
          <button
            type="button"
            onClick={() => setByTotal(!byTotal)}
            className="border-0 bg-transparent text-right font-sans text-[11px] font-bold uppercase tracking-[0.7px] text-muted"
          >
            Jami
          </button>
          <span />
        </div>
        <div className="flex flex-col gap-2">
          {sorted.map((line, i) => (
            <PayrollRow key={line.id} line={line} index={i + 1} onOpen={() => onOpen(line)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 md:hidden">
        {sorted.map((line) => (
          <PayrollCard key={line.id} line={line} onOpen={() => onOpen(line)} />
        ))}
      </div>

      {/*
        [SV4] Ustunlar yig'indisi `JAMI` ga to'g'ri kelishi kerak, va
        `Oylik yoki foiz — kattasi` da yutgan tomon ustunda qoladi, yutqazgani
        `—` bo'ladi. Buni aytmaslik direktorni "nega asosiy bo'sh?" degan
        savolga qoldiradi va u rejimni `SUM` deb o'qiydi.
      */}
      <p className="mt-3 px-3 text-[11.5px] font-medium leading-[1.45] text-muted">
        «Oylik yoki foiz — kattasi» rejimida faqat yutgan tomon ustunda turadi — ikkinchisi «—» bo&apos;ladi.
      </p>
    </NmCard>
  );
}
