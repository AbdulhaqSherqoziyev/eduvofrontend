'use client';

import { useState } from 'react';
import { ChevronDown, Coins } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Skeleton } from '@/components/shared/skeleton';
import { NmButton } from '@/components/ui/nm-button';
import { monthFromDay, monthName, ruleSummary } from '@/lib/utils/payroll-labels';
import { cn } from '@/lib/utils/cn';
import type { SubjectType } from '@/lib/types/payroll';
import { BonusFields } from './bonus-fields';
import { CompensationFields } from './compensation-fields';
import { EffectiveFromNote } from './effective-from-note';
import { LiveExample } from './live-example';
import { SchemePicker } from './scheme-picker';
import type { CompensationBlockCtl } from './use-compensation-block';

interface CompensationBlockProps {
  ctl: CompensationBlockCtl;
  subjectType: SubjectType;
  /** `null` — xodim hali yaratilmagan (yangi o'qituvchi / yangi xodim formasi). */
  subjectId: string | null;
  subjectName: string;
}

/**
 * "Ish haqi" bloki (§A) — o'qituvchi va xodim dialoglarining eng ostida.
 *
 * `compensation.update` YO'Q bo'lsa umuman render qilinmaydi: qulf ikonkasi
 * "u yerda nima bor?" degan savol tug'diradi va o'sha savolga hamkasb javob
 * beradi; yo'q blok esa hech narsa so'ramaydi [§G.1, S5.2].
 *
 * Dialog ustidan dialog ochilmaydi — blok INLINE ochiladi: 360px da ikkinchi
 * qatlam fokusni uzib yuboradi.
 */
export function CompensationBlock({ ctl, subjectType, subjectId, subjectName }: CompensationBlockProps) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const { allowed, query, view, draft, errors, open, setOpen, patch, withBonus, pending, saveError } = ctl;

  if (!allowed) return null;

  const rule = query.data?.rule ?? null;
  const active = query.data?.activeRule ?? null;
  // `rule` — kelgusidagi eng yangi versiya, `active` — SHU oyni to'layotgani.
  // Ular farq qilishi normal holat [SV3], shuning uchun ikkalasi ham yoziladi:
  // faqat yangisini ko'rsatish "hisob allaqachon shunday" degan ma'no beradi.
  const drifted = !!active && active.id !== rule?.id;

  return (
    <div className="mt-5 border-t border-[rgba(122,134,153,0.18)] pt-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex min-h-[62px] w-full items-center gap-3 rounded-ctl bg-background px-4 py-3',
          'text-left font-sans shadow-nm-inset-sm transition-all',
        )}
      >
        <Coins className="size-[18px] shrink-0 text-primary" strokeWidth={2.2} />
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-bold text-foreground">Ish haqi</span>
          {query.isLoading ? (
            <Skeleton className="mt-1 h-[14px] w-[180px]" />
          ) : (
            <span className="block truncate text-[11.5px] font-medium text-muted">
              {/*
                Qoida o'chirilgan, lekin joriy oy hali eski qoida bo'yicha
                to'lanayotgan holat ham bor (`rule = null`, `activeRule` bor).
                Unda "Hali sozlanmagan" deyish YOLG'ON bo'lardi — o'sha oy uchun
                qoida bor va u ishlayapti.
              */}
              {rule
                ? ruleSummary(rule)
                : active
                  ? `${monthName(query.data!.currentPeriod)} hisobi: ${ruleSummary(active)}`
                  : "Hali sozlanmagan — keyinroq ham qo'shish mumkin."}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[12.5px] font-bold text-primary">
          {rule ? "O'zgartirish" : 'Sozlash'}
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} strokeWidth={2.4} />
        </span>
      </button>

      {drifted && active && rule ? (
        <p className="mt-2 px-1 text-[11.5px] font-medium text-muted">
          {monthName(query.data!.currentPeriod)} hisobi: {ruleSummary(active)} (
          {monthFromDay(active.effectiveFromPeriod)} kuchga kirgan)
        </p>
      ) : null}

      {/* Qoidani yuklab bo'lmasa ham qolgan forma ishlayveradi (§A.8). */}
      {query.isError ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
          <span className="text-[12.5px] font-semibold text-foreground">
            Ish haqi qoidasini yuklab bo&apos;lmadi.
          </span>
          <NmButton type="button" variant="soft" size="sm" onClick={() => query.refetch()}>
            Qayta urinish
          </NmButton>
        </div>
      ) : null}

      {open && view ? (
        <div className="mt-4 flex flex-col gap-5">
          <SchemePicker value={draft.scheme} onChange={(scheme) => patch({ scheme })} disabled={pending} />
          <CompensationFields draft={draft} errors={errors} onChange={patch} disabled={pending} />

          {/* Jonli misol serverdagi haqiqiy ma'lumotni o'qiydi, ya'ni mavjud
              xodim kerak. Yangi xodim formasida u hali yo'q. */}
          {subjectId ? (
            <LiveExample
              subjectType={subjectType}
              subjectId={subjectId}
              draft={draft}
              withBonus={withBonus}
              onSchemeChange={(scheme) => patch({ scheme })}
            />
          ) : null}

          {withBonus ? (
            <BonusFields draft={draft} errors={errors} onChange={patch} disabled={pending} />
          ) : null}

          <EffectiveFromNote
            view={view}
            thisMonth={draft.thisMonth}
            onChange={(thisMonth) => patch({ thisMonth })}
            disabled={pending}
          />

          {saveError ? <p className="text-[11.5px] font-semibold text-danger">{saveError}</p> : null}

          {rule && subjectId ? (
            <NmButton
              type="button"
              variant="danger"
              size="sm"
              className="self-start"
              disabled={pending}
              onClick={() => setRemoveOpen(true)}
            >
              Qoidani o&apos;chirish
            </NmButton>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={ctl.confirmOpen}
        onOpenChange={(next) => !next && ctl.resolveConfirm(false)}
        title="Ish haqi qoidasini o'zgartirish"
        message={
          draft.thisMonth
            ? `${subjectName} uchun yangi qoida ${monthFromDay(view?.currentPeriod ?? '')} qo'llanadi. ${monthName(view?.currentPeriod ?? '')} hisobi qayta hisoblanadi — xodim ekranidagi raqam o'zgaradi.`
            : `${subjectName} uchun yangi qoida ${monthFromDay(view?.defaultEffectiveFromPeriod ?? '')} kuchga kiradi. ${monthName(view?.currentPeriod ?? '')} hisobi o'zgarmaydi.`
        }
        confirmLabel="O'zgartirish"
        tone="soft"
        pending={pending}
        onConfirm={() => ctl.resolveConfirm(true)}
      />

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title="Qoidani o'chirish"
        message="Qoida o'chirilsa, xodim keyingi oydan hisobga kirmaydi. O'tgan oylarning hisobi saqlanadi."
        confirmLabel="O'chirish"
        pending={pending}
        onConfirm={async () => {
          await ctl.removeRule();
          setRemoveOpen(false);
        }}
      />
    </div>
  );
}
