export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  seq: number;
  date: string;
  type: TransactionType;
  category: string;
  party: string;
  note: string;
  amount: number;
  method: string;
  voided: boolean;
  reversalOf: string | null;
  /** Which login performed the entry — "Full Name (phone)", '' on legacy rows. */
  createdBy: string;
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
