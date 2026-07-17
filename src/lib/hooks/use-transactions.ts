import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactions';
import type { TransactionListParams } from '../types/transaction';

const KEY = 'transactions';

export function useTransactions(params: TransactionListParams) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => transactionsApi.list(params) });
}

export function useTransactionSummary() {
  return useQuery({ queryKey: [KEY, 'summary'], queryFn: transactionsApi.summary });
}

export function useVoidTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.void(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['payment-summary'] });
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
