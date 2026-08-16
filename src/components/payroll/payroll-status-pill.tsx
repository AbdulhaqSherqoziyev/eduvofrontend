'use client';

import { Check, Clock } from 'lucide-react';
import { StatusPill } from '@/components/shared/status-pill';
import { formatDate } from '@/lib/utils/date';
import type { PeriodStatus } from '@/lib/types/payroll';

/** Davr tugadimi — joriy oy uchun "hali davom etmoqda". */
export function monthOver(period: string, now = new Date()): boolean {
  const [year, month] = period.split('-').map(Number);
  return new Date(Date.UTC(year, month, 1)) <= now;
}

/**
 * Yorliq ostidagi jumla (§C.3) — holatlar orasidagi haqiqiy farq shu yerda.
 *
 * Uchinchi pill ATAYLAB yo'q: ustoz `DRAFT`/`APPROVED`/`PAID` tartibini
 * o'rganishga majbur bo'lmasin. Jumla o'qiladi va yodlashni talab qilmaydi,
 * yorliq esa yodlashni talab qiladi.
 */
export function payrollStatusNote(status: PeriodStatus, period: string, paidAt: string | null): string {
  if (status === 'PAID') return `To'landi · ${formatDate(paidAt)}`;
  if (status === 'APPROVED') return "Bu raqam tasdiqlangan va o'zgarmaydi.";
  return monthOver(period) ? 'Oy tugadi — hisob tekshirilmoqda.' : 'Oy tugagach yakuniy raqam tasdiqlanadi.';
}

/**
 * Ustoz ekranidagi holat yorlig'i — FAQAT IKKITA [S1].
 *
 * `tone="warning"` butun blokda ishlatilmaydi (§0.7): sariq "muammo" degani,
 * oraliq hisob esa muammo emas.
 */
export function PayrollStatusPill({ status }: { status: PeriodStatus }) {
  const approved = status === 'APPROVED' || status === 'PAID';
  return (
    <StatusPill
      label={approved ? 'Tasdiqlangan' : 'Oraliq hisob (oy tugamagan)'}
      tone={approved ? 'success' : 'muted'}
      icon={
        approved ? (
          <Check className="size-3.5" strokeWidth={2.6} />
        ) : (
          <Clock className="size-3.5" strokeWidth={2.4} />
        )
      }
    />
  );
}
