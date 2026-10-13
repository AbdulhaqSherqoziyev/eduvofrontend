'use client';

import { NmCard } from '@/components/ui/nm-card';
import { AmountRow } from '@/components/payroll/amount-row';
import { formatSom } from '@/lib/utils/format';
import {
  adjustmentLabel, monthName, REFUND_HINT, ruleSummary, shortDay, somOrDash, somSigned,
} from '@/lib/utils/payroll-labels';
import type { MyPayrollView } from '@/lib/types/payroll';

export interface LinesRequest {
  period: string;
  title: string;
  showShare: boolean;
}

/**
 * Ustozning ulushi — foizning XOM natijasi, ya'ni "tushganning 50% i".
 *
 * Backend `GUARANTEE` da YUTGAN tomonni ustunda qoldirib, yutqazganini nolga
 * tushiradi (`payroll-calc.util.ts`), chunki ustunlar `Jami` ga qo'shilishi
 * kerak. Ustoz ekranida esa taqqoslashning IKKALA tomoni ham ko'rinishi shart —
 * aks holda "qoida: kattasi olinadi" qatori nimadan nima tanlanganini
 * aytmaydi. Xom qiymat serverning o'z maydonlaridan tiklanadi, formula
 * takrorlanmaydi: `guaranteeGap = max(0, tan oylik − ulush)`.
 */
function shareCandidate(me: MyPayrollView): number {
  if (!me.rule) return 0;
  if (me.rule.mode === 'SUM') return me.share;
  return me.share > 0 ? me.share : Math.max(0, me.rule.baseSalary - me.guaranteeGap);
}

interface BreakdownCardProps {
  me: MyPayrollView;
  onOpenLines: (request: LinesRequest) => void;
}

/** "Qanday hisoblandi" (§C.5) — har raqam bosiladi [S1]. */
export function BreakdownCard({ me, onOpenLines }: BreakdownCardProps) {
  const rule = me.rule;
  if (!rule) return null;

  const month = monthName(me.period);
  const collected = me.groups.reduce((sum, g) => sum + g.collected, 0);
  const share = shareCandidate(me);
  const withPercent = rule.percent > 0 && rule.mode !== 'PER_LESSON';
  const ruleLine =
    rule.mode === 'SUM' ? "Qoida: oylik va ulush qo'shiladi →" : 'Qoida: oylik va ulushdan kattasi olinadi →';

  return (
    <NmCard className="p-[22px]">
      <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">Qanday hisoblandi</div>
      <p className="mb-2 mt-1 text-[11.5px] font-medium text-muted">
        Har bir raqamni bosib, qaysi to&apos;lovlardan chiqqanini ko&apos;rishingiz mumkin.
      </p>

      <AmountRow
        label={rule.mode === 'PER_LESSON' ? 'Darsbay' : 'Tan oylik'}
        value={somOrDash(me.base)}
      />

      {withPercent ? (
        <>
          <AmountRow
            label="O'quvchilaringizdan tushgan"
            value={somOrDash(collected)}
            onClick={() =>
              onOpenLines({ period: me.period, title: `Tushgan to'lovlar · ${month}`, showShare: false })
            }
          />
          <AmountRow
            label={`Shundan sizning ulushingiz (${rule.percent}%)`}
            value={somOrDash(share)}
            onClick={() =>
              onOpenLines({
                period: me.period,
                title: `Sizning ulushingiz (${rule.percent}%) · ${month}`,
                showShare: true,
              })
            }
          />
          <AmountRow
            divider
            label={ruleLine}
            value={somOrDash(me.base + me.share)}
            hint={
              /*
                [SV6] KAFOLAT PLATOSI. `GUARANTEE` da ulush tan oylikdan kichik
                bo'lsa, katta raqam oy davomida UMUMAN qimirlamaydi va ustoz
                "to'lovlarim sanalmayapti" deb o'ylaydi — "tizim buzuq"
                xulosasining eng tez yo'li. Bitta jumla uni butunlay yopadi:
                ustoz endi nima kutayotganini biladi.
              */
              me.guaranteeGap > 0 ? (
                <>
                  Hozircha tan oylik kattaroq — ulush {formatSom(rule.baseSalary)}dan oshganda hisob o&apos;sa
                  boshlaydi.
                </>
              ) : null
            }
          />
        </>
      ) : null}

      {me.bonus > 0 ? <AmountRow label="Yangi o'quvchi bonusi" value={somSigned(me.bonus)} /> : null}

      {/*
        Keyin tushgan to'lov va har qanday kamayish — ALOHIDA KO'RINADIGAN
        qator [D6, SV6]. `Jami` ichiga singdirilmaydi: ustoz raqam qayerdan
        kelganini ko'rmasa ishonch yo'qoladi, va jimgina kamaygan katta raqam
        S1 ni butunlay buzadi.
      */}
      {me.adjustments.map((a, i) => (
        <AmountRow
          key={`${a.label}-${i}`}
          label={adjustmentLabel(a)}
          value={somSigned(a.amount)}
          hint={a.amount < 0 ? REFUND_HINT : a.note || null}
          onClick={
            a.sourcePeriod
              ? () =>
                  onOpenLines({
                    period: a.sourcePeriod!,
                    title:
                      a.amount < 0
                        ? `${monthName(a.sourcePeriod!)} uchun qaytarilgan to'lovlar`
                        : `${monthName(a.sourcePeriod!)} uchun keyin tushgan to'lovlar`,
                    showShare: false,
                  })
              : undefined
          }
        />
      ))}

      <AmountRow total label="Jami" value={somOrDash(me.total)} />

      <p className="mt-2.5 px-2 text-[11.5px] font-medium leading-[1.45] text-muted">
        Qoida:{' '}
        {ruleSummary({
          baseSalary: rule.baseSalary,
          revenuePercent: rule.percent,
          perLessonRate: rule.perLessonRate,
          combineMode: rule.mode === 'SUM' ? 'SUM' : 'GUARANTEE',
        })}
        {/* Qoida davr ichida o'zgargan bo'lsa sababi ekranda turishi SHART —
            aks holda §C.4 dagi "faqat oshadi" va'dasi tushuntirilmagan holda
            buziladi [SV3]. */}
        {me.ruleChangedAt ? ` · Qoida shu oy ichida o'zgardi (${shortDay(me.ruleChangedAt)})` : ''}
      </p>
    </NmCard>
  );
}
