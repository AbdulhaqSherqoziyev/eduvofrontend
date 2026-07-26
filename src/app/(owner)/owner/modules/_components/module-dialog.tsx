'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowRight, Check, ChevronRight, PauseCircle } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmSwitch } from '@/components/ui/nm-switch';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { formatNumber } from '@/lib/utils/format';
import { bundleLabel, type OwnerModule, type UpdateModuleInput } from '@/lib/api/owner-modules';
import { useUpdateModule } from './use-owner-modules';
import { MoneyField, groupDigits, parseMoney } from './money-field';
import * as T from './labels';

interface ModuleDialogProps {
  module: OwnerModule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Resolve a `requires` key to its Uzbek name. */
  nameOf: (key: string) => string;
  /** Fired after a successful save so the card can flash "Saqlandi ✓". */
  onSaved: () => void;
}

/** Price + texts + sale-state editor. The only place a module can be changed. */
export function ModuleDialog({ module, open, onOpenChange, nameOf, onSaved }: ModuleDialogProps) {
  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title={module.nameUz}>
      {/* Remounts on every open, so no stale draft survives a cancel. */}
      <DialogBody
        module={module}
        nameOf={nameOf}
        onSaved={onSaved}
        onClose={() => onOpenChange(false)}
      />
    </NmDialog>
  );
}

type Busy = 'save' | 'sale' | null;

function DialogBody({
  module: m,
  nameOf,
  onSaved,
  onClose,
}: Omit<ModuleDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  const [price, setPrice] = useState(() => groupDigits(String(Math.round(m.monthlyFee))));
  const [nameUz, setNameUz] = useState(m.nameUz);
  const [nameRu, setNameRu] = useState(m.nameRu);
  const [benefitUz, setBenefitUz] = useState(m.benefitUz);
  const [benefitRu, setBenefitRu] = useState(m.benefitRu);
  const [active, setActive] = useState(m.isActive);
  const [askRetire, setAskRetire] = useState(false);
  /** Set once a sale-state PATCH has landed — turns [Bekor] into [Yopish] (R9). */
  const [saleResult, setSaleResult] = useState<'retired' | 'restored' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const update = useUpdateModule(m.key);

  const priceNum = parseMoney(price);
  const priceEmpty = !m.isCore && priceNum === null;
  const priceChanged = !m.isCore && priceNum !== null && priceNum !== m.monthlyFee;
  const guard10x =
    !m.isCore &&
    priceNum !== null &&
    m.monthlyFee > 0 &&
    (priceNum >= m.monthlyFee * 10 || priceNum * 10 <= m.monthlyFee);

  const texts = [
    { value: nameUz, original: m.nameUz, field: 'nameUz' as const },
    { value: nameRu, original: m.nameRu, field: 'nameRu' as const },
    { value: benefitUz, original: m.benefitUz, field: 'benefitUz' as const },
    { value: benefitRu, original: m.benefitRu, field: 'benefitRu' as const },
  ];
  const textChanged = texts.some((t) => t.value.trim() !== t.original);
  const textEmpty = texts.some((t) => t.value.trim() === '');

  const canSave = !busy && !priceEmpty && !textEmpty && (priceChanged || textChanged);
  const saveLabel = (() => {
    if (busy === 'save') return T.SAVING;
    if (priceChanged && priceNum !== null) return T.savePriceLabel(m.monthlyFee, priceNum);
    if (textChanged) return T.SAVE_TEXTS;
    return T.NO_CHANGES;
  })();

  const save = async () => {
    const patch: UpdateModuleInput = {};
    if (priceChanged && priceNum !== null) patch.monthlyFee = priceNum;
    for (const t of texts) if (t.value.trim() !== t.original) patch[t.field] = t.value.trim();
    setError(null);
    setBusy('save');
    try {
      await update.mutateAsync(patch);
      onSaved();
      onClose();
    } catch {
      setError(T.SAVE_ERROR);
    } finally {
      setBusy(null);
    }
  };

  // isActive rides its own PATCH: different meaning, different risk than a price edit.
  const setSale = async (next: boolean) => {
    setError(null);
    setBusy('sale');
    try {
      const row = await update.mutateAsync({ isActive: next });
      setActive(row.isActive);
      setSaleResult(next ? 'restored' : 'retired');
      setAskRetire(false);
    } catch {
      setError(T.SAVE_ERROR);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="text-[12px] font-semibold text-muted">
          <span className="font-mono">{m.key}</span> · {bundleLabel(m.bundle)} guruhi
        </div>
        <div className="text-[13px] font-bold text-[#5b6b82]">{T.usageText(m)}</div>
        {m.requires.length > 0 ? (
          <div className="text-[12.5px] font-medium text-muted">
            {T.requiresText(m.requires.map(nameOf))}
          </div>
        ) : null}
      </div>

      {m.isCore ? (
        <div className="rounded-ctl bg-background p-4 shadow-nm-inset-sm">
          <div className="text-[14px] font-bold text-success">{T.CORE_TITLE}</div>
          <div className="mt-1 text-[12px] font-medium text-muted">{T.CORE_HINT}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <FieldLabel htmlFor={`fee-${m.key}`}>OYLIK NARX</FieldLabel>
            <MoneyField id={`fee-${m.key}`} value={price} onValueChange={setPrice} />
            {priceEmpty ? (
              <div className="mt-1.5 text-[12px] font-bold text-danger">{T.PRICE_EMPTY}</div>
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-3 rounded-ctl bg-background px-4 py-3 shadow-nm-inset-sm">
            <span className="text-[15px] font-bold text-muted">{formatNumber(m.monthlyFee)}</span>
            <ArrowRight className="size-4 flex-shrink-0 text-[#9aa6b8]" strokeWidth={2.4} />
            <span className="text-[18px] font-extrabold text-foreground">
              {priceNum === null ? '—' : formatNumber(priceNum)}
            </span>
            <span className="text-[12.5px] font-semibold text-muted">so&apos;m</span>
          </div>

          <p className="text-[12.5px] font-medium leading-[1.55] text-[#5b6b82]">
            {T.applyScopeText(m.tenantCount)}
          </p>

          {guard10x ? (
            <div className="flex items-start gap-2.5 rounded-ctl bg-[rgba(232,161,58,0.17)] px-3.5 py-3">
              <AlertTriangle className="mt-px size-4 flex-shrink-0 text-warning" strokeWidth={2.2} />
              <span className="text-[12.5px] font-bold leading-[1.5] text-warning">{T.GUARD_10X}</span>
            </div>
          ) : null}
        </div>
      )}

      <details className="group">
        <summary className="flex h-11 cursor-pointer list-none items-center gap-2 text-[13.5px] font-bold text-primary [&::-webkit-details-marker]:hidden">
          <ChevronRight
            className="size-4 flex-shrink-0 transition-transform duration-200 group-open:rotate-90"
            strokeWidth={2.4}
          />
          {T.TEXTS_SUMMARY}
        </summary>
        <div className="mt-1 flex flex-col gap-3.5 rounded-ctl bg-background p-4 shadow-nm-inset-sm">
          <p className="text-[12px] font-medium text-muted">{T.TEXTS_HINT}</p>
          <TextField label="NOMI (UZ)" value={nameUz} onValueChange={setNameUz} error={T.NAME_EMPTY} />
          <TextField label="NOMI (RU)" value={nameRu} onValueChange={setNameRu} error={T.NAME_EMPTY} />
          <TextArea
            label="FOYDA TAVSIFI (UZ)"
            value={benefitUz}
            onValueChange={setBenefitUz}
            error={T.BENEFIT_EMPTY}
          />
          <TextArea
            label="FOYDA TAVSIFI (RU)"
            value={benefitRu}
            onValueChange={setBenefitRu}
            error={T.BENEFIT_EMPTY}
          />
        </div>
      </details>

      {m.isCore ? null : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[14px] font-bold text-foreground">
              {active ? (
                <Check className="size-[17px] text-success" strokeWidth={2.4} />
              ) : (
                <PauseCircle className="size-[17px] text-warning" strokeWidth={2.2} />
              )}
              {active ? T.ON_SALE : T.RETIRED}
            </span>
            <NmSwitch
              checked={active}
              disabled={busy !== null}
              aria-label={T.ON_SALE}
              onCheckedChange={(next) => (next ? setSale(true) : setAskRetire(true))}
            />
          </div>

          {saleResult ? (
            <div
              className={
                saleResult === 'retired'
                  ? 'flex items-center gap-2 text-[12.5px] font-bold text-warning'
                  : 'flex items-center gap-2 text-[12.5px] font-bold text-success'
              }
            >
              {saleResult === 'retired' ? (
                <PauseCircle className="size-4 flex-shrink-0" strokeWidth={2.2} />
              ) : (
                <Check className="size-4 flex-shrink-0" strokeWidth={2.4} />
              )}
              {saleResult === 'retired' ? T.RETIRED_ROW : T.RESTORED_ROW}
            </div>
          ) : null}

          {askRetire ? (
            <div className="animate-fadein rounded-ctl bg-background p-4 shadow-nm-inset-sm">
              <div className="text-[14px] font-bold text-foreground">{T.RETIRE_QUESTION}</div>
              <p className="mt-1.5 text-[12.5px] font-medium leading-[1.55] text-[#5b6b82]">
                {T.retireBody(m.tenantCount)}
              </p>
              <div className="mt-3.5 flex gap-3">
                <NmButton
                  type="button"
                  variant="soft"
                  size="sm"
                  className="flex-1"
                  onClick={() => setAskRetire(false)}
                >
                  Bekor
                </NmButton>
                <NmButton
                  type="button"
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  disabled={busy !== null}
                  onClick={() => setSale(false)}
                >
                  Sotuvdan olish
                </NmButton>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {error ? <div className="text-[13px] font-bold text-danger">{error}</div> : null}

      <div className="mt-1 flex flex-col-reverse gap-3 min-[380px]:flex-row">
        <NmButton
          type="button"
          variant="soft"
          className="h-[46px] w-full min-[380px]:flex-1"
          onClick={onClose}
        >
          {saleResult ? 'Yopish' : 'Bekor'}
        </NmButton>
        <NmButton
          type="button"
          className="h-[46px] w-full min-[380px]:flex-[1.4]"
          disabled={!canSave}
          onClick={save}
        >
          {saveLabel}
        </NmButton>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onValueChange,
  error,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  error: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <NmInput
        value={value}
        onChange={(e) => onValueChange(e.currentTarget.value)}
        className="text-[16px] md:text-[14.5px]"
      />
      {value.trim() === '' ? (
        <div className="mt-1.5 text-[12px] font-bold text-danger">{error}</div>
      ) : null}
    </div>
  );
}

function TextArea({
  label,
  value,
  onValueChange,
  error,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  error: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <NmTextarea
        rows={3}
        value={value}
        onChange={(e) => onValueChange(e.currentTarget.value)}
        className="text-[16px] md:text-[14.5px]"
      />
      {value.trim() === '' ? (
        <div className="mt-1.5 text-[12px] font-bold text-danger">{error}</div>
      ) : null}
    </div>
  );
}
