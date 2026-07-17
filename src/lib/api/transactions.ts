import { api } from './client';
import { cleanParams } from './http';
import type { Paginated } from './http';
import type { Transaction, TransactionListParams, TransactionSummary } from '../types/transaction';

export const transactionsApi = {
  list: (params: TransactionListParams) =>
    api.get<Paginated<Transaction>>('/transactions', { params: cleanParams(params) }).then((r) => r.data),
  summary: () => api.get<TransactionSummary>('/transactions/summary').then((r) => r.data),
  void: (id: string) => api.post<Transaction>(`/transactions/${id}/void`).then((r) => r.data),
};
