import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cashApi, expenseCategoriesApi } from '../api/cash';
import type { CategoryListParams, CloseDayInput, DayNoteInput, OpeningInput } from '../types/cash';
import { CASH_KEY, invalidateCash } from './use-transactions';

const CAT_KEY = 'expense-categories';

/** The drawer figure. `staleTime: 0` on purpose — see invalidateCash. */
export function useCashBalance() {
  return useQuery({ queryKey: [CASH_KEY, 'balance'], queryFn: cashApi.balance });
}

/** `enabled` keeps the request inside the open day-end dialog. */
export function useDayEnd(date: string, enabled = true) {
  return useQuery({ queryKey: [CASH_KEY, 'day-end', date], queryFn: () => cashApi.dayEnd(date), enabled });
}

export function useCloseDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CloseDayInput) => cashApi.closeDay(input),
    onSuccess: () => invalidateCash(qc),
  });
}

/** §D.5 — the only thing a cashier may still change on a day they signed. */
export function useUpdateDayNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DayNoteInput) => cashApi.updateNote(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CASH_KEY] }),
  });
}

export function useReopenDay() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => cashApi.reopenDay(id), onSuccess: () => invalidateCash(qc) });
}

export function useSetOpening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OpeningInput) => cashApi.setOpening(input),
    onSuccess: () => {
      invalidateCash(qc);
      qc.invalidateQueries({ queryKey: ['tenant-settings'] });
    },
  });
}

export function useExpenseCategories(params: CategoryListParams = {}, enabled = true) {
  return useQuery({
    queryKey: [CAT_KEY, params],
    queryFn: () => expenseCategoriesApi.list(params),
    enabled,
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; type?: 'EXPENSE' | 'INCOME' }) => expenseCategoriesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CAT_KEY] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseCategoriesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CAT_KEY] }),
  });
}
