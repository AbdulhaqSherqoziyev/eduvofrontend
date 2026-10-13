'use client';

import { Banknote, Check, FileText } from 'lucide-react';
import { StatusPill } from '@/components/shared/status-pill';
import { NmButton } from '@/components/ui/nm-button';
import { Can } from '@/components/shared/can';
import { formatDateTime } from '@/lib/utils/date';
import type { PeriodView } from '@/lib/types/payroll';

interface PeriodHeaderProps {
  view: PeriodView;
  computed: boolean;
  busy: string | null;
  online: boolean;
  onCompute: () => void;
  onApprove: () => void;
  onReopen: () => void;
  onPay: () => void;
}

/**
 * Davr sarlavhasi va oqim tugmalari (§E.2).
 *
 * HAR HOLATDA AYNAN BITTA PRIMARY, `PAID` da esa umuman yo'q: to'langan oyda
 * bajariladigan ish qolmaydi, va yorqin tugma bajariladigan ishi bo'lmagan
 * joyda "yana nimadir qilishim kerakmi?" degan savol tug'diradi.
 *
 * `payroll.approve` yo'q foydalanuvchida tugmalar RENDER QILINMAYDI — jadval
 * o'qish uchun ochiq qolaveradi (§E.8).
 */
export function PeriodHeader({
  view, computed, busy, online, onCompute, onApprove, onReopen, onPay,
}: PeriodHeaderProps) {
  const draft = view.status === 'DRAFT';
  const disabled = !!busy || !online;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {draft ? (
          computed ? (
            <StatusPill label="Qoralama" tone="muted" icon={<FileText className="size-3.5" strokeWidth={2.2} />} />
          ) : (
            <StatusPill label="Hisoblanmagan" tone="muted" />
          )
        ) : view.status === 'APPROVED' ? (
          <StatusPill label="Tasdiqlangan" tone="primary" icon={<Check className="size-3.5" strokeWidth={2.6} />} />
        ) : (
          <StatusPill label="To'langan" tone="success" icon={<Banknote className="size-3.5" strokeWidth={2.2} />} />
        )}

        <Can permission="payroll.approve">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {draft && computed ? (
              <NmButton variant="soft" disabled={disabled} onClick={onCompute} className="w-full sm:w-auto">
                {busy === 'compute' ? 'Hisoblanmoqda…' : 'Qayta hisoblash'}
              </NmButton>
            ) : null}
            {view.status === 'APPROVED' ? (
              <NmButton variant="danger" disabled={disabled} onClick={onReopen} className="w-full sm:w-auto">
                Tasdiqni bekor qilish
              </NmButton>
            ) : null}
            {draft ? (
              <NmButton disabled={disabled} onClick={computed ? onApprove : onCompute} className="w-full sm:w-auto">
                {busy === 'compute' ? 'Hisoblanmoqda…' : computed ? 'Tasdiqlash' : 'Hisoblash'}
              </NmButton>
            ) : null}
            {view.status === 'APPROVED' && view.id ? (
              <Can permission="payroll.pay">
                <NmButton disabled={disabled} onClick={onPay} className="w-full sm:w-auto">
                  To&apos;lovni yozish
                </NmButton>
              </Can>
            ) : null}
          </div>
        </Can>
      </div>

      <p className="text-[11.5px] font-medium text-muted">
        {view.computedAt
          ? `Oxirgi hisoblash: ${formatDateTime(view.computedAt)}.`
          : 'Bu davr hali hisoblanmagan.'}
      </p>
    </div>
  );
}
