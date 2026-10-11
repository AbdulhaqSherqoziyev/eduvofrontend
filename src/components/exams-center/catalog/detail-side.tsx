'use client';

import { can } from '@/lib/auth/permissions';
import { kr } from '../exam-meta';
import { Card, PrimaryButton, SoftButton } from '../ui';

interface PriceProps { price: number; canStart: boolean; pending: boolean; soon?: boolean; onStart: () => void; onAssign: () => void }

/** "TO'LIQ MOCK" card (design v3 DETAIL right column). Start = free staff preview. */
export function PriceCard({ price, canStart, pending, soon, onStart, onAssign }: PriceProps) {
  return (
    <Card className="flex flex-col gap-3 p-6">
      <div className="text-[10.5px] font-bold tracking-[0.8px] text-muted">TO&apos;LIQ MOCK</div>
      <div className="text-[28px] font-extrabold tracking-[-0.5px]">{kr(price)}</div>
      <PrimaryButton className="h-12 text-[14.5px]" disabled={!canStart || soon} onClick={onStart}>
        {pending ? 'Ochilmoqda…' : "To'liq mockni boshlash"}
      </PrimaryButton>
      {can('exam.assign') ? (
        <SoftButton className="h-11 font-extrabold text-primary" disabled={soon} onClick={onAssign}>Guruhga tayinlash</SoftButton>
      ) : null}
      {soon ? <p className="text-[12.5px] font-bold text-[#B7790F]">Tez kunda</p> : null}
      <p className="text-[12px] font-semibold leading-[1.5] text-muted">
        Bitta bo&apos;lim: 1 kredit. Har imtihonda 1 ta bepul namunaviy bo&apos;lim bor.
      </p>
    </Card>
  );
}

/** "Qanday baholanadi" — copy verbatim from the design. */
export function ScoringCard({ estimate }: { estimate: boolean }) {
  return (
    <Card className="flex flex-col gap-3.5 p-6">
      <div className="text-[15px] font-extrabold">Qanday baholanadi</div>
      <div className="flex gap-3">
        <span className="h-max rounded-[7px] bg-[#E5F5EE] px-2 py-1 text-[10.5px] font-extrabold text-[#1F7A55]">AUTO</span>
        <p className="text-[13px] leading-[1.55] text-[#5b6b82]">
          Javoblar kaliti bilan solishtiriladi, keyin aylantirish jadvali orqali ballga o&apos;tkaziladi. Natija darhol chiqadi.
        </p>
      </div>
      <div className="flex gap-3">
        <span className="h-max rounded-[7px] bg-[#EEE9FF] px-2 py-1 text-[10.5px] font-extrabold text-[#5B3FD1]">AI</span>
        <p className="text-[13px] leading-[1.55] text-[#5b6b82]">
          Writing va Speaking&apos;ni AI rasmiy mezonlar bo&apos;yicha 2 marta baholaydi. Natija bir necha daqiqada, oraliq ko&apos;rinishida chiqadi.
        </p>
      </div>
      {estimate ? (
        <p className="text-[12.5px] font-bold leading-[1.5] text-[#B7790F]">
          Adaptiv imtihon: rasmiy ball formulasi ochiq emas, shuning uchun ball taxminiy ko&apos;rsatiladi.
        </p>
      ) : null}
    </Card>
  );
}
