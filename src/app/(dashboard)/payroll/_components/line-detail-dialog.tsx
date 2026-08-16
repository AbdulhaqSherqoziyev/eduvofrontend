'use client';

import { useState } from 'react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { StatusPill } from '@/components/shared/status-pill';
import { Can } from '@/components/shared/can';
import { AmountRow } from '@/components/payroll/amount-row';
import { formatDate } from '@/lib/utils/date';
import { monthLabel, somOrDash, somSigned } from '@/lib/utils/payroll-labels';
import type { PeriodLineView, PeriodStatus } from '@/lib/types/payroll';
import { AdjustDialog } from './adjust-dialog';
import { subjectRole } from './payroll-row';

interface LineDetailDialogProps {
  line: PeriodLineView;
  period: string;
  status: PeriodStatus;
  onOpenChange: (open: boolean) => void;
  onPayOne: (line: PeriodLineView) => void;
  canPay: boolean;
}

/**
 * Xodim detali (§E.5).
 *
 * Individual to'lov shu yerdan yoziladi: naqd maosh amalda birma-bir beriladi,
 * direktor esa oy oxirida "hammasi yopildimi?" deb qaraydi — shuning uchun
 * ikkala yo'l ham bor [§J.2/4].
 */
export function LineDetailDialog({
  line, period, status, onOpenChange, onPayOne, canPay,
}: LineDetailDialogProps) {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const draft = status === 'DRAFT';

  return (
    <>
      <NmDialog open onOpenChange={onOpenChange} title={`${line.subjectName} · ${monthLabel(period)}`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <StatusPill
              label={draft ? 'Qoralama' : status === 'APPROVED' ? 'Tasdiqlangan' : "To'langan"}
              tone={draft ? 'muted' : status === 'APPROVED' ? 'primary' : 'success'}
            />
            <span className="text-[12px] font-semibold text-muted">{subjectRole(line)}</span>
          </div>

          <div>
            <AmountRow label="Tan oylik" value={somOrDash(line.base)} />
            <AmountRow label="Ulush" value={somOrDash(line.share)} />
            {line.bonus ? <AmountRow label="Yangi o'quvchi bonusi" value={somSigned(line.bonus)} /> : null}
            {/* Tuzatish `Jami` ichiga singdirilmaydi — alohida qator [D6]. */}
            <AmountRow divider label="Qo'lda tuzatish" value={line.adjust ? somSigned(line.adjust) : '—'} />
            <AmountRow total label="Jami" value={somOrDash(line.total)} />
          </div>

          {line.paid ? (
            <p className="text-[11.5px] font-medium text-muted">To&apos;langan · {formatDate(line.paidAt)}</p>
          ) : null}

          <div className="sticky bottom-0 flex flex-wrap gap-3 bg-background pt-1">
            <Can permission="payroll.approve">
              <NmButton
                variant="soft"
                className="flex-1"
                disabled={!draft}
                onClick={() => setAdjustOpen(true)}
              >
                Tuzatish qo&apos;shish
              </NmButton>
            </Can>
            {canPay && !draft && !line.paid ? (
              <NmButton variant="soft" className="flex-1" onClick={() => onPayOne(line)}>
                To&apos;lovni yozish
              </NmButton>
            ) : null}
            <NmButton variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
              Yopish
            </NmButton>
          </div>

          {!draft ? (
            <p className="text-[11.5px] font-medium text-muted">
              Tasdiqlangan davrga tuzatish kiritilmaydi. Keyingi oyda qo&apos;shishingiz mumkin.
            </p>
          ) : null}
        </div>
      </NmDialog>

      {adjustOpen ? (
        <AdjustDialog
          open
          onOpenChange={setAdjustOpen}
          line={line}
          onDone={() => {
            setAdjustOpen(false);
            onOpenChange(false);
          }}
        />
      ) : null}
    </>
  );
}
