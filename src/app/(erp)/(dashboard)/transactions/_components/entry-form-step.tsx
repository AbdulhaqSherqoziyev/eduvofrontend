'use client';

import { Clock } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { can } from '@/lib/auth/permissions';
import { useDayEnd } from '@/lib/hooks/use-cash';
import { useTenantSettings } from '@/lib/hooks/use-tenant-settings';
import { formatNumber } from '@/lib/utils/format';
import { isoDay } from '@/lib/utils/tx-display';
import { AmountField } from '@/components/shared/amount-field';
import { CategorySelect } from './category-select';
import { backdatedNote, type DraftErrors, type EntryDraft } from './entry-state';

const TYPES = [
  { value: 'EXPENSE', label: 'Chiqim' },
  { value: 'INCOME', label: 'Kirim' },
];
const METHODS = [
  { value: 'CASH', label: 'Naqd' },
  { value: 'CARD', label: 'Karta' },
];

/** Small inset statement — a fact about what will happen, not a warning. */
function InsetNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-ctl bg-background p-3 text-[11.5px] font-medium text-foreground shadow-nm-inset-sm">
      <Clock className="mt-[1px] size-3.5 shrink-0 text-muted" />
      <span>{children}</span>
    </div>
  );
}

interface EntryFormStepProps {
  draft: EntryDraft;
  onChange: (patch: Partial<EntryDraft>) => void;
  errors: DraftErrors;
  /** Editing an own PENDING/RETURNED row — the direction cannot change. */
  editing?: boolean;
}

/** §B.1 — the entry form itself. */
export function EntryFormStep({ draft, onChange, errors, editing }: EntryFormStepProps) {
  const { data: settings } = useTenantSettings();
  const dayEnd = useDayEnd(draft.date, !!draft.date && draft.date <= isoDay());

  const limit = settings?.expenseApprovalLimit ?? 0;
  const amount = Number(draft.amount || 0);
  const overLimit = draft.type === 'EXPENSE' && limit > 0 && amount > limit;
  const approver = can('transaction.approve');
  const backdated = backdatedNote(draft.date);
  const dayClosed = !!dayEnd.data?.closedAt;

  return (
    <div className="flex flex-col gap-5">
      {editing ? null : (
        <div>
          <FieldLabel>TUR</FieldLabel>
          <NmSegmented
            items={TYPES}
            value={draft.type}
            // Switching direction clears the category so an expense line can
            // never end up attached to an income entry; the amount, date and
            // note stay put (§B.1).
            onValueChange={(v) => onChange({ type: v as EntryDraft['type'], categoryId: '' })}
          />
        </div>
      )}

      <AmountField
        label="SUMMA"
        value={draft.amount}
        onChange={(v) => onChange({ amount: v })}
        autoFocus
        error={errors.amount}
      >
        {overLimit ? (
          <InsetNote>
            {approver
              ? 'Bu summa chegaradan yuqori, lekin sizda tasdiqlash huquqi bor — yozuv darhol kuchga kiradi.'
              : `Bu summa tasdiq chegarasidan yuqori (${formatNumber(limit)}). Yozuv direktor tasdig'idan keyin kassadan chiqadi.`}
          </InsetNote>
        ) : null}
      </AmountField>

      <CategorySelect
        type={draft.type}
        value={draft.categoryId}
        onChange={(id) => onChange({ categoryId: id })}
        error={errors.category}
      />

      <div>
        <FieldLabel>USUL</FieldLabel>
        <NmSegmented
          items={METHODS}
          value={draft.method}
          onValueChange={(v) => onChange({ method: v as EntryDraft['method'] })}
        />
      </div>

      <div>
        <FieldLabel htmlFor="entry-date">SANA</FieldLabel>
        <NmInput
          id="entry-date"
          type="date"
          max={isoDay()}
          value={draft.date}
          onChange={(e) => onChange({ date: e.target.value })}
        />
        {errors.date ? <div className="mt-1.5 text-[11.5px] font-semibold text-danger">{errors.date}</div> : null}
        {backdated ? <div className="mt-1.5 text-[11.5px] font-medium text-muted">{backdated}</div> : null}
        {dayClosed ? (
          <InsetNote>Bu kun allaqachon yakunlangan. Yozuv o&apos;sha kunning farqini o&apos;zgartiradi.</InsetNote>
        ) : null}
      </div>

      <div>
        <FieldLabel htmlFor="entry-party">
          {draft.type === 'INCOME' ? 'KIMDAN (IXTIYORIY)' : 'KIMGA (IXTIYORIY)'}
        </FieldLabel>
        <NmInput
          id="entry-party"
          maxLength={120}
          placeholder="Masalan: Vahob aka (ijara)"
          value={draft.party}
          onChange={(e) => onChange({ party: e.target.value })}
        />
      </div>

      <div>
        <FieldLabel htmlFor="entry-note">IZOH (IXTIYORIY)</FieldLabel>
        <NmTextarea
          id="entry-note"
          rows={2}
          maxLength={500}
          placeholder="Nima uchun? Masalan: avgust oyi uchun"
          value={draft.note}
          onChange={(e) => onChange({ note: e.target.value })}
        />
      </div>
    </div>
  );
}
