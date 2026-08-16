/** Cash balance, day-end count and expense categories (spec §A.2, §D, §B.3). */

export interface CashFlow {
  income: number;
  expense: number;
  transfer: number;
}

export interface CashBalance {
  asOf: string;
  opening: { set: boolean; cash: number; card: number; at: string | null };
  /** null until the opening balance is set — a figure from an unknown start
   *  would be wrong, and a wrong cash balance is worse than none (§A.3). */
  cash: number | null;
  card: number | null;
  total: number | null;
  today: CashFlow;
  month: CashFlow & { label: string };
  /** Sent ONLY to `report.finance` holders. Undefined means "do not render" —
   *  never 0, never a lock icon (§A.2, §G.1). */
  net?: number;
  pending: { count: number; amount: number };
}

export interface DayEndView {
  date: string;
  openingSet: boolean;
  expectedCash: number | null;
  breakdown: { prev: number; income: number; expense: number; transfer: number };
  /** Same-day expenses still waiting on the director. Out of `expectedCash`,
   *  but the cash may already be gone — so the dialog says so (§D.2a). */
  pending: { count: number; amount: number; ids: string[] };
  actualCash: number | null;
  diff: number | null;
  note: string;
  presetReason: string;
  id: string | null;
  closedAt: string | null;
  closedBy: string;
  /** The most recent day that is signed and still signed, across the center —
   *  null when none ever was. Names the day in "Oxirgi yakun — 13.08." (§D.6). */
  lastClosedDate: string | null;
}

export interface CloseDayInput {
  date: string;
  actualCash: number;
  /** Mandatory once the count differs — the backend answers 400 without it. */
  presetReason?: string;
  note?: string;
}

/** PATCH /cash/day-end/:id — the explanation only; the figures are settled.
 *  An empty string is a deliberate clear, so the field is never omitted. */
export interface DayNoteInput {
  id: string;
  note: string;
}

export interface OpeningInput {
  cashOpening: number;
  cardOpening: number;
  openingAt?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  isSystem: boolean;
  /** false = the app writes it; a person never picks it from the dropdown. */
  selectable: boolean;
  sortOrder: number;
}

export interface CategoryListParams {
  type?: 'EXPENSE' | 'INCOME';
  selectable?: boolean;
}
