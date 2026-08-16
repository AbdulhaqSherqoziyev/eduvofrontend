import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactions';
import type {
  CreateEntryInput,
  ReasonInput,
  TransactionListParams,
  UpdateEntryInput,
} from '../types/transaction';

export const TX_KEY = 'transactions';
export const CASH_KEY = 'cash';

/**
 * Refetch everything a money write can move.
 *
 * Deliberately NOT optimistic (spec §0.4): the cashier hands out notes against
 * the balance on this screen, and a figure that is briefly wrong costs more
 * than the 300 ms of waiting it saves.
 */
export function invalidateCash(qc: QueryClient): void {
  [TX_KEY, CASH_KEY, 'dashboard'].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
}

/** Same, plus the student-money screens a refund rolls back. */
function invalidatePayments(qc: QueryClient): void {
  invalidateCash(qc);
  ['invoices', 'payment-summary', 'students'].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
}

export function useTransactions(params: TransactionListParams) {
  return useQuery({ queryKey: [TX_KEY, params], queryFn: () => transactionsApi.list(params) });
}

export function useTransactionSummary() {
  return useQuery({ queryKey: [TX_KEY, 'summary'], queryFn: transactionsApi.summary });
}

/** Approval queue. `enabled` so the cashier never fires a 403 request. */
export function usePendingTransactions(enabled: boolean) {
  return useQuery({ queryKey: [TX_KEY, 'pending'], queryFn: transactionsApi.pending, enabled });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEntryInput) => transactionsApi.create(input),
    onSuccess: () => invalidateCash(qc),
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; input: UpdateEntryInput }) => transactionsApi.update(v.id, v.input),
    onSuccess: () => invalidateCash(qc),
  });
}

/** The undo button (§B.5). Rejects with 409 `UNDO_WINDOW_EXPIRED` when late. */
export function useDiscardEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.discard(id),
    onSuccess: () => invalidateCash(qc),
  });
}

export function useWithdrawEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.withdraw(id),
    onSuccess: () => invalidateCash(qc),
  });
}

export function useApproveEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.approve(id),
    onSuccess: () => invalidateCash(qc),
  });
}

export function useAskClarification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; input: ReasonInput }) => transactionsApi.askClarification(v.id, v.input),
    onSuccess: () => invalidateCash(qc),
  });
}

export function useCorrectEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; input: ReasonInput }) => transactionsApi.correct(v.id, v.input),
    onSuccess: () => invalidateCash(qc),
  });
}

export function useRefundEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; input: ReasonInput }) => transactionsApi.refund(v.id, v.input),
    onSuccess: () => invalidatePayments(qc),
  });
}
