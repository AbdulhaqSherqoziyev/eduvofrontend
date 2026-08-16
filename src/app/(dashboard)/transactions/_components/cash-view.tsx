'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WifiOff } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { can } from '@/lib/auth/permissions';
import { useCashBalance, useDayEnd, useExpenseCategories } from '@/lib/hooks/use-cash';
import { useTransactions } from '@/lib/hooks/use-transactions';
import { useOnline } from '@/lib/hooks/use-online';
import { isoDay } from '@/lib/utils/tx-display';
import type { Transaction } from '@/lib/types/transaction';
import { ApprovalDialog } from './approval-dialog';
import { CashActions } from './cash-actions';
import { CashBalanceCard } from './cash-balance-card';
import { DayEndDialog } from './day-end-dialog';
import { EntryDialog } from './entry-dialog';
import { draftFromEntry, emptyDraft, type EntryDraft } from './entry-state';
import {
  DEFAULT_FILTERS, filterSummary, isFiltered, rangeBounds, WAITING, type LedgerFilters,
} from './ledger-filters';
import { OpeningBalanceCard } from './opening-balance-card';
import { PendingStrip } from './pending-strip';
import { TransactionDetailDialog } from './transaction-detail-dialog';
import { TransactionTable } from './transaction-table';
import { TransferDialog } from './transfer-dialog';
import { TxFilters } from './tx-filters';
import { UndoStrip } from './undo-strip';

interface EntryState {
  open: boolean;
  initial: EntryDraft;
  editId: string | null;
}

/** §A — the cash desk: balance, actions, ledger, and every dialog they open. */
export function CashView() {
  const params = useSearchParams();
  const [filters, setFilters] = useState<LedgerFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [entry, setEntry] = useState<EntryState>({ open: false, initial: emptyDraft('EXPENSE'), editId: null });
  const [transferOpen, setTransferOpen] = useState(false);
  const [dayEndOpen, setDayEndOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [undo, setUndo] = useState<Transaction | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const online = useOnline();
  const balance = useCashBalance();
  const today = isoDay();
  const dayEnd = useDayEnd(today);
  const categories = useExpenseCategories({});
  const approver = can('transaction.approve');

  const query = useTransactions({
    ...rangeBounds(filters.range),
    search: filters.search || undefined,
    type: filters.type || undefined,
    categoryId: filters.categoryId || undefined,
    status: filters.status.length ? filters.status : undefined,
    page,
    limit: pageSize,
  });

  // §C.5 — the dashboard anchor lands here with the queue already open.
  useEffect(() => {
    if (params.get('pending') === '1' && approver) setApprovalOpen(true);
  }, [params, approver]);

  const patch = (p: Partial<LedgerFilters>) => {
    setFilters((prev) => ({ ...prev, ...p }));
    setPage(1);
  };
  const clear = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };
  // Both entry points mean the same thing: show me what is still waiting —
  // whether on the director (PENDING) or on a document (RETURNED).
  const showPending = () => {
    setFilters({ ...DEFAULT_FILTERS, status: WAITING, range: 'all' });
    setPage(1);
  };

  // The freshly written row keeps a ring for three seconds so the eye lands on
  // it without the list having to reorder or animate (§B.4).
  const onSaved = (tx: Transaction) => {
    setUndo(tx);
    setFlashId(tx.id);
    window.setTimeout(() => setFlashId((id) => (id === tx.id ? null : id)), 3000);
  };

  const openEntry = (type: 'INCOME' | 'EXPENSE') =>
    setEntry({ open: true, initial: emptyDraft(type), editId: null });
  const reopenEntry = (tx: Transaction, mode: 'edit' | 'copy') => {
    setDetail(null);
    setEntry({ open: true, initial: draftFromEntry(tx), editId: mode === 'edit' ? tx.id : null });
  };

  const filtered = isFiltered(filters);
  const categoryName = categories.data?.find((c) => c.id === filters.categoryId)?.name;
  const openingSet = balance.data?.opening.set ?? true;

  return (
    <section className="flex flex-col gap-5">
      {!online ? (
        <div className="sticky top-0 z-20 flex items-center gap-2 rounded-ctl bg-background px-4 py-2.5 text-[12px] font-semibold text-foreground shadow-nm-inset-sm">
          <WifiOff className="size-3.5 text-muted" />
          Internet yo&apos;q — yangi yozuv saqlanmaydi.
        </div>
      ) : null}

      <CashActions
        openingSet={openingSet}
        closedAt={dayEnd.data?.closedAt ?? null}
        reopened={!!dayEnd.data?.id && !dayEnd.data?.closedAt}
        lastClosed={dayEnd.data?.lastClosedDate ?? null}
        onExpense={() => openEntry('EXPENSE')}
        onIncome={() => openEntry('INCOME')}
        onTransfer={() => setTransferOpen(true)}
        onDayEnd={() => setDayEndOpen(true)}
      />

      {balance.data?.opening.set === false ? <OpeningBalanceCard /> : null}
      <CashBalanceCard />

      {balance.data ? (
        <PendingStrip
          count={balance.data.pending.count}
          amount={balance.data.pending.amount}
          onOpen={() => (approver ? setApprovalOpen(true) : showPending())}
        />
      ) : null}

      {undo ? <UndoStrip tx={undo} onDone={() => setUndo(null)} onOpenDetail={setDetail} /> : null}

      <TxFilters value={filters} onChange={patch} />
      {filtered ? (
        <div className="flex flex-wrap items-center gap-3 px-1 text-[12.5px] font-semibold text-muted">
          <span>{filterSummary(filters, categoryName)}</span>
          <NmButton variant="ghost" size="sm" className="min-h-[44px] px-0 text-primary" onClick={clear}>
            Filtrlarni tozalash
          </NmButton>
        </div>
      ) : null}

      <TransactionTable
        query={query}
        page={page}
        pageSize={pageSize}
        onPage={setPage}
        onPageSize={(s) => { setPageSize(s); setPage(1); }}
        filtered={filtered}
        onClear={clear}
        onNewExpense={() => openEntry('EXPENSE')}
        onOpen={setDetail}
        flashId={flashId}
      />

      <EntryDialog
        open={entry.open}
        onOpenChange={(open) => setEntry((prev) => ({ ...prev, open }))}
        initial={entry.initial}
        editId={entry.editId}
        onSaved={onSaved}
      />
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} onSaved={onSaved} />
      <DayEndDialog open={dayEndOpen} onOpenChange={setDayEndOpen} date={today} onShowPending={showPending} />
      {approver ? <ApprovalDialog open={approvalOpen} onOpenChange={setApprovalOpen} /> : null}
      {detail ? (
        <TransactionDetailDialog
          tx={detail}
          rows={query.data?.items ?? []}
          onOpenChange={(open) => !open && setDetail(null)}
          onSelect={setDetail}
          onEdit={reopenEntry}
        />
      ) : null}
    </section>
  );
}
