'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { AmountField } from '@/components/shared/amount-field';
import { NmButton } from '@/components/ui/nm-button';
import { cn } from '@/lib/utils/cn';
import { formatSom } from '@/lib/utils/format';
import {
  AMOUNT_LABEL, AMOUNT_PLACEHOLDER, BTN_FIX_THOUSANDS, CHOICE_CUSTOM, CHOICE_GROUP, FAR_FROM_GROUP, FREE_HINT,
  PRICE_BLOCK_LABEL, PRICE_DIALOG_TITLE, RESET_TO_GROUP, SAME_AS_GROUP, isFarFromGroup, priceDiffLine,
  thousandsQuestion,
} from '@/lib/utils/price-labels';

export type PriceMode = 'group' | 'custom';

export const PRICE_FIELD_ID = 'enrollment-price';

interface PriceChoiceProps {
  groupPrice: number;
  mode: PriceMode;
  digits: string;
  onModeChange: (mode: PriceMode) => void;
  onDigitsChange: (digits: string) => void;
  disabled?: boolean;
  error?: string;
  /** The 1–999 error is showing: "Ha, tuzatish" moves under it, the C row hides. */
  thousandsError?: boolean;
  /** Shown only when the student already has their own price (§2.1, SHOULD 18). */
  onReset?: () => void;
  /** Focus the field when the user picks "Boshqa narx" — not on first open. */
  focusField?: boolean;
}

const INFO_BLOCK =
  'mt-2 flex items-start gap-2 rounded-[12px] bg-background px-3 py-2.5 shadow-nm-inset-sm text-[12px] font-semibold leading-[1.5] text-foreground';
const DIFF_LINE = 'mt-1.5 text-[11.5px] font-semibold text-muted';

/** Radio card — the `SchemePicker` pattern: aria-checked + inset shadow + filled dot. */
function ChoiceCard({ active, disabled, onClick, children }: {
  active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex min-h-[52px] w-full items-center gap-3 rounded-ctl border-0 bg-background px-4 py-2 text-left font-sans transition-all',
        active ? 'shadow-nm-inset-sm' : 'shadow-nm-sm',
        !active && !disabled ? 'nm-pressable' : '',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-[18px] shrink-0 items-center justify-center rounded-full',
          active ? 'border-2 border-primary' : 'border-2 border-[#9aa6b8]',
        )}
      >
        {active ? <span className="size-2 rounded-full bg-primary" /> : null}
      </span>
      <span className={cn('flex flex-wrap text-[13.5px] font-bold', active ? 'text-primary' : 'text-[#5b6b82]')}>
        {children}
      </span>
    </button>
  );
}

/** One helper row under the amount — the first matching rule of §2.2 wins. */
function HelperRow({ digits, groupPrice, disabled, onFix, hideThousands }: {
  digits: string; groupPrice: number; disabled?: boolean; onFix: () => void; hideThousands?: boolean;
}) {
  if (digits === '') return null; // A
  const v = Number(digits);
  const g = groupPrice;
  if (v === 0) {
    // B
    return (
      <div className={INFO_BLOCK}>
        <Info className="size-4 shrink-0 text-primary" />
        <span>{FREE_HINT}</span>
      </div>
    );
  }
  if (v < 1000) {
    // C
    if (hideThousands) return null;
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-foreground">
        <span>{thousandsQuestion(v)}</span>
        <NmButton type="button" variant="soft" size="sm" disabled={disabled} onClick={onFix}>
          {BTN_FIX_THOUSANDS}
        </NmButton>
      </div>
    );
  }
  if (v === g) return <div className={DIFF_LINE}>{SAME_AS_GROUP}</div>; // D
  if (g === 0) return null;
  const diff = <div className={DIFF_LINE}>{priceDiffLine(v, g)}</div>;
  if (!isFarFromGroup(v, g)) return diff; // F
  // E — does not block saving, asks for no tick.
  return (
    <>
      {diff}
      <div className="mt-2 flex items-start gap-2 rounded-[12px] bg-[rgba(232,161,58,0.17)] px-3 py-2.5 text-[12px] font-semibold text-warning">
        <AlertTriangle className="size-4 shrink-0" />
        <span>{FAR_FROM_GROUP}</span>
      </div>
    </>
  );
}

/** §2.1 — group price vs. own price, with the amount field and its one helper line. */
export function PriceChoice({
  groupPrice, mode, digits, onModeChange, onDigitsChange, disabled, error, thousandsError, onReset, focusField,
}: PriceChoiceProps) {
  const fix = () => {
    onDigitsChange(String(Number(digits) * 1000));
    // The button took focus; hand it back so typing can continue.
    requestAnimationFrame(() => document.getElementById(PRICE_FIELD_ID)?.focus());
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.9px] text-muted">{PRICE_BLOCK_LABEL}</span>
          {onReset ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onReset}
              className="min-h-[36px] text-[12.5px] font-bold text-primary hover:underline disabled:opacity-60"
            >
              {RESET_TO_GROUP}
            </button>
          ) : null}
        </div>
        <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={PRICE_DIALOG_TITLE}>
          <ChoiceCard active={mode === 'group'} disabled={disabled} onClick={() => onModeChange('group')}>
            {CHOICE_GROUP}&nbsp;—&nbsp;<span className="font-extrabold">{formatSom(groupPrice)}</span>
          </ChoiceCard>
          <ChoiceCard active={mode === 'custom'} disabled={disabled} onClick={() => onModeChange('custom')}>
            {CHOICE_CUSTOM}
          </ChoiceCard>
        </div>
      </div>

      {mode === 'custom' ? (
        <AmountField
          id={PRICE_FIELD_ID}
          label={AMOUNT_LABEL}
          placeholder={AMOUNT_PLACEHOLDER}
          value={digits}
          onChange={onDigitsChange}
          autoFocus={focusField}
          disabled={disabled}
          error={error}
        >
          {thousandsError ? (
            <NmButton type="button" variant="soft" size="sm" className="mt-2" disabled={disabled} onClick={fix}>
              {BTN_FIX_THOUSANDS}
            </NmButton>
          ) : null}
          <HelperRow
            digits={digits}
            groupPrice={groupPrice}
            disabled={disabled}
            onFix={fix}
            hideThousands={thousandsError}
          />
        </AmountField>
      ) : null}
    </div>
  );
}
