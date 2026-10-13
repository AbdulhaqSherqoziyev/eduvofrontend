'use client';

import { useState } from 'react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { Skeleton } from '@/components/shared/skeleton';
import { ErrorCard } from '@/components/shared/error-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useCreateCategory, useDeleteCategory, useExpenseCategories } from '@/lib/hooks/use-cash';
import type { ExpenseCategory } from '@/lib/types/cash';

/**
 * §H — the category list, kept out of the entry dialog on purpose: "delete"
 * should not sit next to a cashier's hand while they are writing an expense.
 *
 * Deleting keeps history intact — old entries stay in their category, the name
 * simply stops being offered — and that is exactly what the confirmation says.
 */
export function CategoryManagerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState<ExpenseCategory | null>(null);
  const list = useExpenseCategories({}, open);
  const create = useCreateCategory();
  const remove = useDeleteCategory();

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title="Xarajat kategoriyalari">
      {list.isLoading ? <Skeleton className="h-[200px] w-full" /> : null}
      {list.isError ? <ErrorCard onRetry={() => list.refetch()} /> : null}

      {list.data ? (
        <div className="flex flex-col gap-2.5">
          {list.data.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-ctl bg-background px-4 py-2.5 shadow-nm-inset-sm"
            >
              <span className="min-w-0 truncate text-[13.5px] font-bold text-foreground">{c.name}</span>
              {c.isSystem ? (
                <span className="shrink-0 text-[11.5px] font-medium text-muted">Tizim kategoriyasi</span>
              ) : (
                <NmButton variant="ghost" size="sm" className="text-[#5b6b82]" onClick={() => setTarget(c)}>
                  O&apos;chirish
                </NmButton>
              )}
            </div>
          ))}

          <div className="mt-2 flex gap-2">
            <NmInput
              maxLength={40}
              placeholder="Kategoriya nomi"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <NmButton
              variant="soft"
              disabled={!name.trim() || create.isPending}
              onClick={async () => {
                await create.mutateAsync({ name: name.trim(), type: 'EXPENSE' }).catch(() => null);
                setName('');
              }}
            >
              + Yangi kategoriya
            </NmButton>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title={`«${target?.name ?? ''}» kategoriyasini o'chirasizmi?`}
        message="Eski yozuvlar shu kategoriyada qolaveradi — faqat yangi yozuvda tanlab bo'lmaydi."
        confirmLabel="O'chirish"
        pending={remove.isPending}
        onConfirm={async () => {
          if (target) await remove.mutateAsync(target.id);
          setTarget(null);
        }}
      />
    </NmDialog>
  );
}
