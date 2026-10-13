'use client';

import { NmCard } from '@/components/ui/nm-card';
import { payrollStatusNote } from '@/components/payroll/payroll-status-pill';
import { formatSom } from '@/lib/utils/format';
import { dayInMonth, monthName } from '@/lib/utils/payroll-labels';
import type { MyPayrollView } from '@/lib/types/payroll';

/**
 * Natija kartasi (§C.4) — ekrandagi yagona katta raqam.
 *
 * `[SV6]` ORALIQ RAQAM — QUYI CHEGARA, TAXMIN EMAS. "Oraliq hisob" degan yorliq
 * raqam qaysi TOMONGA o'zgarishini aytmaydi, va aytilmasa ustoz eng yomonini
 * o'ylaydi: "hozir 4 mln, oy oxirida 2 mln bo'lib qolmasin". Bitta jumla raqamni
 * "noaniq" dan "kafolatlangan minimum" ga aylantiradi.
 *
 * PROGNOZ TAQIQLANADI: "taxminan X bo'ladi", "yana Y kutilmoqda", progress-bar,
 * foizli to'ldirilish — hech qanday shaklda yo'q. Prognoz — tizim bergan va'da;
 * bajarilmasa aybdor tizim bo'ladi va undan keyin ustoz hech bir raqamga
 * ishonmaydi.
 */
export function ResultCard({ me }: { me: MyPayrollView }) {
  const draft = me.status === 'DRAFT';
  const month = monthName(me.period).toUpperCase();

  return (
    <NmCard className="p-[22px]">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.7px] text-muted">
        {draft ? `${month} oyiga hozirgacha` : `${month} oyi uchun`}
      </div>

      {!me.rule ? (
        <div className="flex flex-col gap-1.5">
          <div className="text-[17px] font-extrabold text-foreground">
            Ish haqi qoidasi hali sozlanmagan.
          </div>
          {/* Tugma ATAYLAB yo'q: ustoz buni o'zi tuzata olmaydi, va tuzata
              olmaydigan ishga tugma qo'yish nochorlikni kuchaytiradi. */}
          <p className="text-[12.5px] font-medium text-muted">Administratordan so&apos;rashingiz mumkin.</p>
        </div>
      ) : me.total > 0 ? (
        <div className="text-[28px] font-extrabold leading-tight tracking-[-0.8px] text-foreground sm:text-[32px]">
          {formatSom(me.total)}
        </div>
      ) : (
        /* `0 so'm` HECH QACHON chizilmaydi [S5.3] — nol javob emas. */
        <div className="flex flex-col gap-1.5">
          <div className="text-[17px] font-extrabold text-foreground">Hisob oy davomida to&apos;ldirilmoqda</div>
          <p className="text-[12.5px] font-medium text-muted">
            {me.rule.baseSalary > 0
              ? `Tan oylik ${formatSom(me.rule.baseSalary)} oy oxirida hisoblanadi.`
              : "Birinchi to'lovlar tushgach shu yerda ko'rinadi."}
          </p>
        </div>
      )}

      {me.rule ? (
        <div className="mt-3 flex flex-col gap-1">
          {draft ? (
            <p className="text-[12.5px] font-semibold leading-[1.45] text-foreground">
              Oy davomida bu raqam faqat oshadi — yangi to&apos;lovlar tushgani sayin.
            </p>
          ) : null}
          <p className="text-[11.5px] font-medium text-muted">
            {payrollStatusNote(me.status, me.period, me.paidAt)}
          </p>
          {/* Bildirishnoma o'rnini bosadi (§C.4): "qachon tasdiqlanadi?" savoli
              javobini bilgan ustozga xabar kerak bo'lmaydi — summali xabar esa
              noto'g'ri qurilmaga ketsa tuzatib bo'lmaydi. */}
          {me.prevPeriod?.approvedAt ? (
            <p className="text-[11.5px] font-medium text-muted">
              O&apos;tgan oy hisobi {dayInMonth(me.prevPeriod.approvedAt)} tasdiqlangan.
            </p>
          ) : null}
        </div>
      ) : null}
    </NmCard>
  );
}
