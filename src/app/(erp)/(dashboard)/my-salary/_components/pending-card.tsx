'use client';

import { NmCard } from '@/components/ui/nm-card';
import { formatSom } from '@/lib/utils/format';
import type { MyPayrollView } from '@/lib/types/payroll';

/**
 * "To'lov kutilmoqda" (§D) — ustozdagi YAGONA bosilmaydigan raqam, va shu ataylab.
 *
 * ISM YO'Q, GURUH KESIMI HAM YO'Q `[SV1]`. Guruh nomi + guruhning oylik narxi
 * ustozga yetishmayotgan to'lovlar SONINI beradi, son esa 8–12 kishilik guruhda
 * konkret bolagacha qisqaradi — ayniqsa ustoz davomat jurnalini ham ko'rgani
 * uchun. Ya'ni kesim ismni ko'rsatmasdan ismni HISOBLAB CHIQARISH vositasi edi.
 *
 * AYIRISH EMAS, QO'SHISH: "− 450 000 ushlandi" taqiqlanadi. Va ikkinchi jumla
 * majburiy `[SV5]` — bosim KECHIKISHDAN emas, YO'QOTISH QO'RQUVIDAN tug'iladi.
 * "Bu pul menga tegmasligi mumkin" deb o'ylagan ustoz bolaga aytadi; "kechroq
 * tegadi" deb bilgani kutadi.
 *
 * Rang neytral — qizil emas, `warning` emas, `AlertTriangle` yo'q [S2].
 */
export function PendingCard({ me }: { me: MyPayrollView }) {
  // Yopilgan davrda kutilayotgan pul keyingi oyga o'tadi — karta o'rniga bir qator.
  if (me.status !== 'DRAFT') {
    return (
      <p className="px-1 text-[12px] font-medium text-muted">
        Bu oy hisobi yopilgan. Keyin tushgan to&apos;lovlar keyingi oyga qo&apos;shiladi.
      </p>
    );
  }
  // Yo'q muammoni ekranga chiqarmaymiz (va `0` taqig'i, §0.5).
  if (!me.pending.total) return null;

  return (
    <NmCard className="p-[22px]">
      <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">To&apos;lov kutilmoqda</div>
      <div className="mt-2 text-[17px] font-extrabold leading-snug text-foreground">
        To&apos;lov kelgach qo&apos;shiladi: {formatSom(me.pending.total)}
      </div>
      <p className="mt-1.5 text-[12.5px] font-medium leading-[1.45] text-muted">
        Bu pul yo&apos;qolmaydi — kelganda keyingi oy hisobingizga qo&apos;shiladi.
      </p>
    </NmCard>
  );
}
