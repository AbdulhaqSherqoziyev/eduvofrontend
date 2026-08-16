/** Cash-desk ledger row — one shape for every entry the screen can show. */

/** What the entry dialogs write. `TRANSFER` is "Pul topshirish" (§E). */
export type EntryType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
/** Stored type — a transfer is an EXPENSE with `kind = TRANSFER`. */
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionKind = 'OPERATIONAL' | 'TRANSFER';
export type TransactionStatus = 'ACTIVE' | 'PENDING' | 'RETURNED' | 'WITHDRAWN' | 'DELETED';

/**
 * The other half of a correction pair, whichever half the row is: on an
 * original it is the correction that reversed it, on a correction it is the
 * original. Always `null` on `/transactions/pending` — nothing awaiting
 * approval has been reversed.
 */
export interface RelatedEntry {
  seq: number;
  date: string;
}

export interface Transaction {
  id: string;
  seq: number;
  date: string;
  /** When the row was written — the 60-second undo window counts from here. */
  createdAt: string;
  type: TransactionType;
  kind: TransactionKind;
  category: string;
  categoryId: string | null;
  party: string;
  note: string;
  amount: number;
  /** Uzbek label ("Naqd"); legacy rows may still read "CASH" — see tx-display. */
  method: string;
  status: TransactionStatus;
  /** True once a correction/refund row mirrors this one. */
  voided: boolean;
  reversalOf: string | null;
  /** Lets "To'g'rilangan · sana" print the correction's date, not this row's,
   *  and lets "Bog'liq yozuv #131" resolve without the pair being on screen. */
  related: RelatedEntry | null;
  correctReason: string;
  returnReason: string;
  returnNote: string;
  /** "Full Name (phone)" — the UI shows the name only (§A.7). */
  createdBy: string;
  createdById: string | null;
  approvedBy: string;
  approvedAt: string | null;
  studentId: string | null;
  invoiceId: string | null;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  /** Absent without `report.finance` — never render it as 0 (§G.1). */
  net?: number;
}

export interface TransactionListParams {
  search?: string;
  type?: EntryType;
  categoryId?: string;
  /** One status or several — sent comma-joined (`PENDING,RETURNED`). `DELETED`
   *  is refused with 400: a discarded entry never reached history. */
  status?: TransactionStatus[];
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/** POST /transactions — `clientRef` makes a retry safe (§B.7). */
export interface CreateEntryInput {
  type: EntryType;
  categoryId?: string;
  amount: number;
  method?: 'CASH' | 'CARD';
  date?: string;
  party?: string;
  note?: string;
  clientRef?: string;
}

/** PATCH /transactions/:id — only an own PENDING/RETURNED row (§C.2). */
export type UpdateEntryInput = Omit<CreateEntryInput, 'type' | 'clientRef'>;

/** Body of the three flows that must say why (§C.4, §F.2, §F.3). */
export interface ReasonInput {
  reason: string;
  note?: string;
}
