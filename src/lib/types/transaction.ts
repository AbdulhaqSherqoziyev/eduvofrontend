export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  party: string;
  note: string;
  amount: number;
  method: string;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  net: number;
}

export interface TransactionListParams {
  search?: string;
  type?: TransactionType;
  page?: number;
  limit?: number;
}
