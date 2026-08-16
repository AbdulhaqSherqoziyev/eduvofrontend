'use client';

import { Search } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { useExpenseCategories } from '@/lib/hooks/use-cash';
import { RANGE_LABELS, TYPE_LABELS, type DateRange, type LedgerFilters } from './ledger-filters';

const TYPES = [{ value: '', label: 'Hammasi' }, ...Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))];

interface TxFiltersProps {
  value: LedgerFilters;
  onChange: (patch: Partial<LedgerFilters>) => void;
}

/**
 * §A.6 — search, direction, category, period.
 *
 * Below 400px the four-way segmented control becomes a select: "Topshirildi"
 * does not fit in a quarter of a 360px screen, and a truncated filter label is
 * a filter nobody trusts.
 */
export function TxFilters({ value, onChange }: TxFiltersProps) {
  // Every category, including the app-written ones — a filter that cannot
  // select "Kassa farqi" would hide rows the list is showing.
  const categories = useExpenseCategories({});

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <NmInput
        icon={<Search className="size-[18px]" />}
        placeholder="Kontragent yoki izoh bo'yicha qidirish"
        value={value.search}
        onChange={(e) => onChange({ search: e.target.value })}
        className="lg:max-w-xs"
      />

      <div className="hidden min-[400px]:block lg:w-[340px]">
        <NmSegmented items={TYPES} value={value.type} onValueChange={(v) => onChange({ type: v as LedgerFilters['type'] })} />
      </div>
      <div className="min-[400px]:hidden">
        <NmSelect value={value.type} onChange={(e) => onChange({ type: e.target.value as LedgerFilters['type'] })}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </NmSelect>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-1">
        <NmSelect
          aria-label="Kategoriya"
          value={value.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value })}
        >
          <option value="">Barcha kategoriya</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NmSelect>
        <NmSelect
          aria-label="Sana"
          value={value.range}
          onChange={(e) => onChange({ range: e.target.value as DateRange })}
        >
          {Object.entries(RANGE_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </NmSelect>
      </div>
    </div>
  );
}
