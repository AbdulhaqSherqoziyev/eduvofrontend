import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactions';
import type { TransactionListParams } from '../types/transaction';

const KEY = 'transactions';

export function useTransactions(params: TransactionListParams) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => transactionsApi.list(params) });
}

export function useTransactionSummary() {
  return useQuery({ queryKey: [KEY, 'summary'], queryFn: transactionsApi.summary });
}
