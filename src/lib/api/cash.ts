import { api } from './client';
import { cleanParams } from './http';
import type {
  CashBalance,
  CategoryListParams,
  CloseDayInput,
  DayEndView,
  DayNoteInput,
  ExpenseCategory,
  OpeningInput,
} from '../types/cash';

export const cashApi = {
  balance: () => api.get<CashBalance>('/transactions/balance').then((r) => r.data),

  /** `date` omitted = today. */
  dayEnd: (date?: string) =>
    api.get<DayEndView>('/cash/day-end', { params: cleanParams({ date }) }).then((r) => r.data),
  closeDay: (payload: CloseDayInput) => api.post<DayEndView>('/cash/day-end', payload).then((r) => r.data),
  /** §D.5 — amend the explanation on a signed day; the amounts stay settled. */
  updateNote: ({ id, note }: DayNoteInput) =>
    api.patch<DayEndView>(`/cash/day-end/${id}`, { note }).then((r) => r.data),
  reopenDay: (id: string) => api.post<{ id: string }>(`/cash/day-end/${id}/reopen`).then((r) => r.data),

  setOpening: (payload: OpeningInput) => api.post<unknown>('/cash/opening', payload).then((r) => r.data),
};

export const expenseCategoriesApi = {
  list: (params: CategoryListParams = {}) =>
    api
      .get<ExpenseCategory[]>('/expense-categories', {
        // `selectable` is a boolean the backend reads as "1"; cleanParams keeps
        // `false` but drops undefined, so an omitted flag stays omitted.
        params: cleanParams({ type: params.type, selectable: params.selectable ? 1 : undefined }),
      })
      .then((r) => r.data),
  create: (payload: { name: string; type?: 'EXPENSE' | 'INCOME' }) =>
    api.post<ExpenseCategory>('/expense-categories', payload).then((r) => r.data),
  remove: (id: string) => api.delete<{ id: string }>(`/expense-categories/${id}`).then((r) => r.data),
};
