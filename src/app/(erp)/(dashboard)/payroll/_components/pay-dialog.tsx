'use client';

import { useMemo, useState } from 'react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { FieldLabel } from '@/components/ui/label';
import { StatusPill } from '@/components/shared/status-pill';
import { useCashBalance } from '@/lib/hooks/use-cash';
import { usePayPayroll } from '@/lib/hooks/use-payroll';
import { apiErrorMessage } from '@/lib/utils/api-error';
import { formatDate } from '@/lib/utils/date';
import { formatSom } from '@/lib/utils/format';
import { somOrDash } from '@/lib/utils/payroll-labels';
import { cn } from '@/lib/utils/cn';
import type { PeriodLineView } from '@/lib/types/payroll';

interface PayDialogProps {
  periodId: string;
  lines: PeriodLineView[];
  /** Bitta xodimga to'lash — detal dialogidan kelganda (§J.2/4). */
  only?: string;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Maosh to'lovini yozish (§E.7).
 *
 * 60 SONIYALIK BEKOR QILISH YO'Q — bu oyda bir marta bajariladigan, tasdiq
 * dialogi ortidagi amal; xato bo'lsa kassadagi "Xatoni to'g'rilash" ishlaydi.
 *
 * `Naqd kassada:` qiymati `somOrDash()` bilan: bo'sh kassada `0 so'm` chiqmaydi
 * (§0.5 butun blokda amal qiladi).
 */
export function PayDialog({ periodId, lines, only, onOpenChange, onDone }: PayDialogProps) {
  const payable = useMemo(
    () => lines.filter((l) => !l.paid && l.total > 0 && (!only || l.id === only)),
    [lines, only],
  );
  const [selected, setSelected] = useState<string[]>(() => payable.map((l) => l.id));
  const [method, setMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [date, setDate] = useState(isoDay(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [clientRef] = useState(() => `payroll-${periodId}-${Date.now()}`);

  const balance = useCashBalance();
  const pay = usePayPayroll();

  const rows = only ? payable : lines.filter((l) => !only);
  const amount = payable.filter((l) => selected.includes(l.id)).reduce((s, l) => s + l.total, 0);
  const cash = balance.data?.cash ?? null;
  const shortOfCash = method === 'CASH' && cash !== null && cash < amount;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onSubmit = async () => {
    if (!selected.length) return setError('Kamida bitta xodimni tanlang.');
    setError(null);
    try {
      await pay.mutateAsync({ periodId, lineIds: selected, method, date, clientRef });
      onDone();
    } catch (e) {
      setError(apiErrorMessage(e, "To'lov yozilmadi — qayta urinib ko'ring."));
    }
  };

  return (
    <NmDialog open onOpenChange={onOpenChange} title="Maosh to'lovini yozish">
      <div className="flex flex-col gap-4">
        <div className="max-h-[36vh] overflow-y-auto">
          {rows.map((line) => (
            <label
              key={line.id}
              className={cn(
                'flex min-h-[48px] items-center gap-3 px-1 py-1.5',
                line.paid && 'opacity-60',
              )}
            >
              <input
                type="checkbox"
                className="size-[18px] accent-[#2e6be6]"
                disabled={line.paid || line.total <= 0}
                checked={selected.includes(line.id)}
                onChange={() => toggle(line.id)}
              />
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                {line.subjectName}
              </span>
              {line.paid ? (
                <StatusPill label={`To'langan · ${formatDate(line.paidAt)}`} tone="muted" />
              ) : (
                <span className="whitespace-nowrap text-[13px] font-extrabold tabular-nums text-foreground">
                  {somOrDash(line.total)}
                </span>
              )}
            </label>
          ))}
        </div>

        <div className="text-[12.5px] font-semibold text-muted">
          Tanlangan: {selected.length} xodim · {somOrDash(amount)}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>USUL</FieldLabel>
            <NmSegmented
              items={[
                { value: 'CASH', label: 'Naqd' },
                { value: 'CARD', label: 'Karta' },
              ]}
              value={method}
              onValueChange={(v) => setMethod(v as 'CASH' | 'CARD')}
            />
          </div>
          <div>
            <FieldLabel htmlFor="payDate">SANA</FieldLabel>
            <NmInput id="payDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <p className="text-[11.5px] font-medium text-muted">
          Kassaga «Maosh» kategoriyasida chiqim yozuvi qo&apos;shiladi.
        </p>
        {method === 'CASH' ? (
          <p className="text-[11.5px] font-medium text-muted">Naqd kassada: {somOrDash(cash)}</p>
        ) : null}
        {shortOfCash ? (
          <p className="text-[11.5px] font-semibold text-danger">
            Naqd kassada {formatSom(cash ?? 0)} bor.
          </p>
        ) : null}
        {error ? <p className="text-[11.5px] font-semibold text-danger">{error}</p> : null}

        <div className="sticky bottom-0 flex gap-3 bg-background pt-1">
          <NmButton variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
            Yopish
          </NmButton>
          <NmButton
            className="flex-[1.4]"
            disabled={pay.isPending || shortOfCash || !selected.length}
            onClick={onSubmit}
          >
            {pay.isPending ? 'Yozilmoqda…' : "To'lovni yozish"}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
