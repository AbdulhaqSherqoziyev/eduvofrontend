'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, Info } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { can } from '@/lib/auth/permissions';
import { useUpdateEnrollmentPrice } from '@/lib/hooks/use-students';
import { cn } from '@/lib/utils/cn';
import {
  BTN_BACK, BTN_CANCEL, BTN_CLOSE, BTN_CONTINUE, BTN_RETRY, BTN_SAVE, BTN_SAVING, ERR_EMPTY, ERR_TOO_BIG,
  FIX_INVOICE_LINK, PRICE_DIALOG_TITLE, PRICE_MAX, SAVE_FAILED, confirmHeadline, confirmNote, errThousands,
  fixInvoiceBody, fixInvoiceSummary, predictApplied, resultLine,
} from '@/lib/utils/price-labels';
import type { EnrollmentPriceResult, StudentProfileGroup } from '@/lib/types/student';
import { PriceChoice, type PriceMode } from './price-choice';

type Step = 'edit' | 'confirm' | 'done';

interface EnrollmentPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  group: StudentProfileGroup;
}

const INFO_BLOCK =
  'flex items-start gap-2 rounded-[12px] bg-background px-3 py-2.5 shadow-nm-inset-sm text-[12px] font-semibold leading-[1.5] text-foreground';

/**
 * A 4xx `message` is written for this user ("A'zolik topilmadi", the 403 on
 * prices); anything else — a dropped connection, a 500 — gets the spec's line.
 */
function saveError(error: unknown): string {
  const res = (error as { response?: { status?: number; data?: { message?: string | string[] } } })?.response;
  const status = res?.status ?? 0;
  if (status < 400 || status >= 500) return SAVE_FAILED;
  const msg = res?.data?.message;
  return (Array.isArray(msg) ? msg[0] : msg) || SAVE_FAILED;
}

/**
 * §2 — change one student's monthly price in one group: edit → confirm → result.
 *
 * One dialog, three contents: a second (confirm) dialog on top of this one is
 * clumsy on a phone. Nothing is optimistic — whether this month's invoice moves
 * is decided by the server, and the result screen says what it decided.
 */
export function EnrollmentPriceDialog({ open, onOpenChange, studentName, group }: EnrollmentPriceDialogProps) {
  const groupPrice = group.price;
  const currentCustom = group.customPrice ?? null;
  const currentEffective = group.effectivePrice ?? groupPrice;
  const liveCi = group.currentInvoice;

  const [step, setStep] = useState<Step>('edit');
  const [mode, setMode] = useState<PriceMode>(currentCustom == null ? 'group' : 'custom');
  const [digits, setDigits] = useState(currentCustom == null ? '' : String(currentCustom));
  const [error, setError] = useState<string>();
  const [thousandsError, setThousandsError] = useState(false);
  const [focusField, setFocusField] = useState(false);
  const [result, setResult] = useState<EnrollmentPriceResult | null>(null);
  // The invoice as it was when "Saqlash" was pressed: the refetch that follows
  // a CURRENT_PERIOD save rewrites it, and the result must describe the change.
  const [savedCi, setSavedCi] = useState(liveCi);
  const ci = step === 'done' ? savedCi : liveCi;
  const [fixOpen, setFixOpen] = useState(false);
  const save = useUpdateEnrollmentPrice(group.enrollmentId);

  const v = Number(digits);
  // §2.4 — the same figure as the group price is not stored as an own price.
  const nextCustom: number | null = mode === 'group' || v === groupPrice ? null : v;
  const nextEffective = nextCustom ?? groupPrice;
  const unchanged = (mode === 'group' || digits !== '') && nextEffective === currentEffective && nextCustom === currentCustom;

  const reset = () => {
    setStep('edit');
    setMode(currentCustom == null ? 'group' : 'custom');
    setDigits(currentCustom == null ? '' : String(currentCustom));
    setError(undefined);
    setThousandsError(false);
    setFocusField(false);
    setResult(null);
    setFixOpen(false);
    save.reset();
  };

  const handleOpenChange = (next: boolean) => {
    if (save.isPending) return; // X, overlay and Esc are all locked while saving (§2.7).
    if (!next) reset();
    onOpenChange(next);
  };

  const onModeChange = (m: PriceMode) => {
    setMode(m);
    setError(undefined);
    setThousandsError(false);
    setFocusField(m === 'custom');
  };

  const onDigitsChange = (d: string) => {
    setDigits(d);
    setError(undefined);
    setThousandsError(false);
  };

  /** §2.3 — checked on "Davom etish", not while typing. */
  const onContinue = () => {
    if (mode === 'custom') {
      if (digits === '') return setError(ERR_EMPTY);
      if (v >= 1 && v <= 999) {
        setThousandsError(true);
        return setError(errThousands(v));
      }
      if (v > PRICE_MAX) return setError(ERR_TOO_BIG);
    }
    save.reset();
    setStep('confirm');
  };

  const onResetToGroup = () => {
    setMode('group');
    setError(undefined);
    setThousandsError(false);
    save.reset();
    setStep('confirm');
  };

  const onSave = async () => {
    try {
      setSavedCi(liveCi);
      const res = await save.mutateAsync({ price: nextCustom });
      setResult(res);
      setStep('done');
    } catch {
      // Stays on the confirm step; the message is rendered from `save.error`.
    }
  };

  const title = (
    <p className="mb-4 text-[13px] font-bold text-muted">
      {studentName} · {group.name}
    </p>
  );

  let body: React.ReactNode;
  if (step === 'edit') {
    body = (
      <>
        {title}
        <PriceChoice
          groupPrice={groupPrice}
          mode={mode}
          digits={digits}
          onModeChange={onModeChange}
          onDigitsChange={onDigitsChange}
          error={error}
          thousandsError={thousandsError}
          onReset={currentCustom != null ? onResetToGroup : undefined}
          focusField={focusField}
        />
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1 px-3 sm:px-5" onClick={() => handleOpenChange(false)}>
            {BTN_CANCEL}
          </NmButton>
          <NmButton type="button" className="flex-[1.4] px-3 sm:px-5" disabled={unchanged} onClick={onContinue}>
            {BTN_CONTINUE}
          </NmButton>
        </div>
      </>
    );
  } else if (step === 'confirm') {
    const pending = save.isPending;
    body = (
      <>
        {title}
        <p className="text-[15px] font-extrabold leading-[1.4] text-foreground">
          {confirmHeadline(currentEffective, nextEffective, nextCustom == null)}
        </p>
        <div className={cn(INFO_BLOCK, 'mt-3')}>
          <Info className="size-4 shrink-0 text-primary" />
          <span>{confirmNote(predictApplied(ci), nextEffective, ci)}</span>
        </div>
        {save.isError ? (
          <p role="alert" className="mt-4 text-[12px] font-semibold text-danger">
            {saveError(save.error)}
          </p>
        ) : null}
        <div className="mt-6 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1 px-3 sm:px-5" disabled={pending} onClick={() => setStep('edit')}>
            {BTN_BACK}
          </NmButton>
          <NmButton type="button" className="flex-[1.4] px-3 sm:px-5" disabled={pending} onClick={onSave}>
            {pending ? BTN_SAVING : save.isError ? BTN_RETRY : BTN_SAVE}
          </NmButton>
        </div>
      </>
    );
  } else if (result) {
    const newPrice = result.effectivePrice;
    // §5 — money is on this month's invoice and the price went DOWN: the old,
    // higher invoice stays. Offer the one existing way to close the difference.
    const showFix =
      result.appliedTo === 'NEXT_PERIOD' &&
      !!ci &&
      newPrice < ci.amount &&
      ci.paidAmount < ci.amount &&
      can('payment.create');
    const diff = ci ? Math.min(ci.amount - newPrice, ci.amount - ci.paidAmount) : 0;
    body = (
      <>
        {title}
        <div className="flex items-start gap-2.5">
          <Check className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={2.6} />
          <p role="status" className="text-[14px] font-bold leading-[1.45] text-foreground">
            {resultLine(result.appliedTo, result.period, newPrice, ci, result.invoiceAmount)}
          </p>
        </div>
        {showFix && ci ? (
          <div className="mt-4">
            <button
              type="button"
              aria-expanded={fixOpen}
              onClick={() => setFixOpen((o) => !o)}
              className="flex min-h-[40px] items-center gap-1.5 text-left text-[12.5px] font-bold text-primary"
            >
              <ChevronRight className={cn('size-4 shrink-0 transition-transform', fixOpen && 'rotate-90')} />
              {fixInvoiceSummary(ci.period)}
            </button>
            {fixOpen ? (
              <div className="pl-[22px]">
                <p className="text-[12px] font-medium leading-[1.5] text-muted">
                  {fixInvoiceBody(ci.period, ci.amount, diff)}
                </p>
                <Link
                  href={`/payments?search=${encodeURIComponent(studentName)}`}
                  className="mt-1.5 inline-block text-[12.5px] font-bold text-primary hover:underline"
                >
                  {FIX_INVOICE_LINK}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="mt-6 flex">
          <NmButton type="button" className="flex-1 px-3 sm:px-5" onClick={() => handleOpenChange(false)}>
            {BTN_CLOSE}
          </NmButton>
        </div>
      </>
    );
  }

  return (
    <NmDialog open={open} onOpenChange={handleOpenChange} title={PRICE_DIALOG_TITLE}>
      {body}
    </NmDialog>
  );
}
