import { api } from './client';
import { cleanParams } from './http';
import type { Paginated } from './http';
import type {
  CreateEntryInput,
  ReasonInput,
  Transaction,
  TransactionListParams,
  TransactionSummary,
  UpdateEntryInput,
} from '../types/transaction';

const one = (id: string) => `/transactions/${id}`;

export const transactionsApi = {
  /** `status` goes over the wire comma-joined — the form the backend documents
   *  (`?status=PENDING,RETURNED`), rather than axios's `status[]=` bracket. */
  list: ({ status, ...params }: TransactionListParams) =>
    api
      .get<Paginated<Transaction>>('/transactions', {
        params: cleanParams({ ...params, status: status?.length ? status.join(',') : undefined }),
      })
      .then((r) => r.data),
  summary: () => api.get<TransactionSummary>('/transactions/summary').then((r) => r.data),
  /** The approval queue — an array, shown one entry at a time (§C.3). */
  pending: () => api.get<Transaction[]>('/transactions/pending').then((r) => r.data),

  create: (payload: CreateEntryInput) => api.post<Transaction>('/transactions', payload).then((r) => r.data),
  update: (id: string, payload: UpdateEntryInput) => api.patch<Transaction>(one(id), payload).then((r) => r.data),

  /** The 60-second undo. 409 `UNDO_WINDOW_EXPIRED` once the window closes. */
  discard: (id: string) => api.delete<{ id: string; status: string }>(one(id)).then((r) => r.data),
  withdraw: (id: string) => api.post<Transaction>(`${one(id)}/withdraw`).then((r) => r.data),

  approve: (id: string) => api.post<Transaction>(`${one(id)}/approve`).then((r) => r.data),
  /** "Aniqlik so'rash" — never a rejection anywhere in the UI (§C.4). */
  askClarification: (id: string, payload: ReasonInput) =>
    api.post<Transaction>(`${one(id)}/return`, payload).then((r) => r.data),

  refund: (id: string, payload: ReasonInput) =>
    api.post<Transaction>(`${one(id)}/refund`, payload).then((r) => r.data),
  correct: (id: string, payload: ReasonInput) =>
    api.post<Transaction>(`${one(id)}/correct`, payload).then((r) => r.data),
};
