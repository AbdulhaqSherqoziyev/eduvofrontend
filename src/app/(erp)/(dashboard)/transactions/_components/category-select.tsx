'use client';

import { useState } from 'react';
import { NmSelect } from '@/components/ui/nm-select';
import { NmInput } from '@/components/ui/nm-input';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { FieldLabel } from '@/components/ui/label';
import { Skeleton } from '@/components/shared/skeleton';
import { X } from 'lucide-react';
import { useCreateCategory, useExpenseCategories } from '@/lib/hooks/use-cash';

const ADD = '__add__';

/** 409 body of a duplicate name — the id of the row that already holds it. */
function existingId(error: unknown): string | null {
  const res = (error as { response?: { status?: number; data?: { code?: string; categoryId?: string } } })?.response;
  if (res?.status !== 409 || res.data?.code !== 'CATEGORY_EXISTS') return null;
  return res.data?.categoryId ?? '';
}

interface CategorySelectProps {
  type: 'EXPENSE' | 'INCOME';
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

/**
 * §B.3 — pick a category, or add one without leaving the dialog.
 *
 * The inline form replaces the select in place instead of opening a second
 * modal: on a 360px screen a dialog above a dialog is the fastest way to trap
 * the keyboard and lose the entry behind it. A duplicate name is not an error
 * either — the existing one is simply selected.
 */
export function CategorySelect({ type, value, onChange, error }: CategorySelectProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [hint, setHint] = useState('');
  const list = useExpenseCategories({ type, selectable: true });
  const create = useCreateCategory();

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setHint('');
    try {
      const made = await create.mutateAsync({ name: trimmed, type });
      onChange(made.id);
      setAdding(false);
      setName('');
    } catch (e) {
      const found = existingId(e);
      if (found === null) {
        setHint("Kategoriya qo'shilmadi — qayta urinib ko'ring.");
        return;
      }
      if (found) onChange(found);
      setAdding(false);
      setName('');
      setHint("Bunday kategoriya bor — ro'yxatdan tanlang.");
    }
  };

  return (
    <div>
      <FieldLabel htmlFor="category">KATEGORIYA</FieldLabel>
      {list.isLoading ? <Skeleton className="h-[50px] w-full" /> : null}

      {list.isError ? (
        <div className="flex flex-col items-start gap-2.5 rounded-ctl bg-background p-3.5 shadow-nm-inset-sm">
          <span className="text-[12.5px] font-semibold text-foreground">Kategoriyalarni yuklab bo&apos;lmadi.</span>
          <NmButton variant="soft" size="sm" onClick={() => list.refetch()}>
            Qayta urinish
          </NmButton>
        </div>
      ) : null}

      {list.data && !adding ? (
        <NmSelect
          id="category"
          value={value}
          onChange={(e) => {
            if (e.target.value === ADD) {
              setAdding(true);
              setHint('');
              return;
            }
            onChange(e.target.value);
          }}
        >
          <option value="">Tanlang</option>
          {list.data.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={ADD}>+ Yangi kategoriya…</option>
        </NmSelect>
      ) : null}

      {adding ? (
        <div className="flex gap-2">
          <NmInput
            autoFocus
            maxLength={40}
            placeholder="Kategoriya nomi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void add();
              }
            }}
          />
          <NmButton variant="soft" disabled={!name.trim() || create.isPending} onClick={add}>
            Qo&apos;shish
          </NmButton>
          <NmIconButton aria-label="Yopish" onClick={() => { setAdding(false); setName(''); }}>
            <X className="size-4" />
          </NmIconButton>
        </div>
      ) : null}

      {list.data?.length === 0 && !adding ? (
        <div className="mt-1.5 text-[11.5px] font-medium text-muted">Kategoriya yo&apos;q — yangisini qo&apos;shing.</div>
      ) : null}
      {hint ? <div className="mt-1.5 text-[11.5px] font-medium text-muted">{hint}</div> : null}
      {error ? <div className="mt-1.5 text-[11.5px] font-semibold text-danger">{error}</div> : null}
    </div>
  );
}
