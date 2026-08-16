'use client';

import { useState } from 'react';
import { WifiOff } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { Skeleton } from '@/components/shared/skeleton';
import { ErrorCard } from '@/components/shared/error-card';
import { Can } from '@/components/shared/can';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDayEnd, useReopenDay } from '@/lib/hooks/use-cash';
import { formatSom } from '@/lib/utils/format';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { somToWords } from '@/lib/utils/som-to-words';
import { AmountField } from '@/components/shared/amount-field';
import { DayEndDiff } from './day-end-diff';
import { DayEndExpected } from './day-end-expected';
import { ClosedDayNote } from './day-end-note';
import { useDayEndForm } from './use-day-end-form';

interface DayEndDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `YYYY-MM-DD`. */
  date: string;
  /** Tapping the pending line filters the ledger instead of explaining twice. */
  onShowPending: () => void;
}

/**
 * §D — the evening count.
 *
 * Only cash is counted; card money sits in a bank account and cannot be held in
 * a hand. The heading says "HISOB BO'YICHA" rather than "should be": one figure
 * is the system's arithmetic, the other is the cashier's count, and a
 * difference can come from either — which is both true and the whole
 * difference between a reconciliation and an accusation.
 */
export function DayEndDialog({ open, onOpenChange, date, onShowPending }: DayEndDialogProps) {
  const [confirmReopen, setConfirmReopen] = useState(false);
  const query = useDayEnd(date, open);
  const reopenDay = useReopenDay();
  const data = query.data;
  const f = useDayEndForm(date, open, data, () => onOpenChange(false));
  const reopened = !!data?.id && !data?.closedAt;

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title={`Kun yakuni · ${formatDate(date)}`}>
      {query.isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[110px] w-full" />
          <Skeleton className="h-[54px] w-full" />
        </div>
      ) : null}
      {query.isError ? <ErrorCard onRetry={() => query.refetch()} /> : null}

      {data ? (
        <div className="flex flex-col gap-5">
          {/* No director's name here on purpose — a reopened day is a task the
              system is asking for, not a person checking up on them (§D.5). */}
          {reopened ? (
            <p className="text-[12px] font-medium text-foreground">
              Bu kun qayta ochildi — sanagan summani yana bir marta kiriting.
            </p>
          ) : null}
          {f.closed ? (
            <p className="text-[12px] font-medium text-muted">Bu kun {formatDateTime(data.closedAt)} da yakunlangan.</p>
          ) : null}

          <DayEndExpected data={data} onShowPending={() => { onOpenChange(false); onShowPending(); }} />

          {f.closed ? (
            <div className="rounded-ctl bg-background p-4 shadow-nm-inset-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.9px] text-muted">
                SANAB CHIQQAN SUMMA (naqd)
              </div>
              <div className="mt-1.5 text-[20px] font-extrabold text-foreground">{formatSom(f.counted)}</div>
              <div className="mt-1 text-[11.5px] font-medium text-muted">{somToWords(f.counted)} so&apos;m</div>
            </div>
          ) : (
            <AmountField label="SANAB CHIQQAN SUMMA (naqd)" value={f.actual} onChange={f.setActual} autoFocus />
          )}

          {f.diff !== null ? (
            <DayEndDiff
              diff={f.diff}
              expected={f.expected}
              pendingAmount={f.pendingAmount}
              reason={f.reason}
              missing={f.missing}
              onReason={f.pickReason}
              readOnly={f.closed}
            />
          ) : null}

          {f.closed ? (
            data.id ? <ClosedDayNote id={data.id} note={data.note} /> : null
          ) : (
            <div>
              <FieldLabel htmlFor="day-note">IZOH (IXTIYORIY)</FieldLabel>
              <NmTextarea id="day-note" rows={2} maxLength={500} value={f.note} onChange={(e) => f.setNote(e.target.value)} />
            </div>
          )}

          <p className="text-[11.5px] font-medium text-muted">Kartadagi pul sanalmaydi — u bank hisobida.</p>
          {f.failure ? (
            <div className="flex items-start gap-2 text-[11.5px] font-medium text-foreground">
              {!f.online ? <WifiOff className="mt-[1px] size-3.5 shrink-0 text-muted" /> : null}
              <span className={f.online ? 'font-semibold text-danger' : ''}>{f.failure}</span>
            </div>
          ) : null}

          <div className="sticky bottom-0 flex gap-3 bg-background pt-1">
            <NmButton variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
              Yopish
            </NmButton>
            {f.closed ? (
              <Can permission="report.finance">
                <NmButton variant="danger" className="flex-[1.6]" onClick={() => setConfirmReopen(true)}>
                  Kunni qayta ochish
                </NmButton>
              </Can>
            ) : (
              <NmButton className="flex-[1.6]" disabled={f.blocked} onClick={f.submit}>
                {f.saving ? 'Yakunlanmoqda…' : 'Kunni yakunlash'}
              </NmButton>
            )}
          </div>

          <ConfirmDialog
            open={confirmReopen}
            onOpenChange={setConfirmReopen}
            title="Kun yakunini qayta ochish"
            message="Farq yozuvi bekor qilinadi va kunni qaytadan yakunlash kerak bo'ladi."
            confirmLabel="Qayta ochish"
            pending={reopenDay.isPending}
            onConfirm={async () => {
              if (!data.id) return;
              await reopenDay.mutateAsync(data.id);
              setConfirmReopen(false);
              onOpenChange(false);
            }}
          />
        </div>
      ) : null}
    </NmDialog>
  );
}
