import type { EntryType, TransactionStatus } from '@/lib/types/transaction';

export type DateRange = 'today' | 'week' | 'month' | 'prev' | 'all';

export interface LedgerFilters {
  search: string;
  type: '' | EntryType;
  categoryId: string;
  range: DateRange;
  /** Set when the cashier taps the pending strip or the day-end line. Empty =
   *  every listable status. */
  status: TransactionStatus[];
}

/**
 * Everything still sitting with somebody else — what both entry points into
 * the filtered list mean (§C.2, §D.2a). `RETURNED` belongs with `PENDING`: a
 * row sent back for a document is money the cashier has written and the
 * balance still does not hold, exactly like one waiting on the director.
 */
export const WAITING: TransactionStatus[] = ['PENDING', 'RETURNED'];

const STATUS_LABELS: Partial<Record<TransactionStatus, string>> = {
  PENDING: 'Tasdiq kutilmoqda',
  RETURNED: 'Aniqlik kutilmoqda',
};

export const RANGE_LABELS: Record<DateRange, string> = {
  today: 'Bugun',
  week: 'Shu hafta',
  month: 'Shu oy',
  prev: "O'tgan oy",
  all: 'Hammasi',
};

export const TYPE_LABELS: Record<string, string> = {
  INCOME: 'Kirim',
  EXPENSE: 'Chiqim',
  TRANSFER: 'Topshirildi',
};

/**
 * "Shu oy" is the default on purpose: the balance card above the list reports
 * the month, and a list showing a different period next to it makes the two
 * sets of figures disagree — which the cashier reads as the system being wrong
 * (§A.6).
 */
export const DEFAULT_FILTERS: LedgerFilters = {
  search: '',
  type: '',
  categoryId: '',
  range: 'month',
  status: [],
};

function midnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Half-open window `[from, to)` — the shape the backend query expects. */
export function rangeBounds(range: DateRange): { from?: string; to?: string } {
  const now = new Date();
  if (range === 'all') return {};
  if (range === 'today') {
    const start = midnight(now);
    return { from: start.toISOString(), to: new Date(start.getTime() + 86_400_000).toISOString() };
  }
  if (range === 'week') {
    // Monday-based, the working week in Uzbekistan.
    const start = midnight(now);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return { from: start.toISOString(), to: new Date(start.getTime() + 7 * 86_400_000).toISOString() };
  }
  const shift = range === 'prev' ? -1 : 0;
  const start = new Date(now.getFullYear(), now.getMonth() + shift, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + shift + 1, 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function isFiltered(f: LedgerFilters): boolean {
  return !!(f.search || f.type || f.categoryId || f.status.length) || f.range !== DEFAULT_FILTERS.range;
}

/** "Shu oy · Chiqim · Ijara" — what is currently narrowing the list. */
export function filterSummary(f: LedgerFilters, categoryName?: string): string {
  const parts = [RANGE_LABELS[f.range]];
  if (f.type) parts.push(TYPE_LABELS[f.type]);
  if (categoryName) parts.push(categoryName);
  f.status.forEach((s) => {
    const label = STATUS_LABELS[s];
    if (label) parts.push(label);
  });
  if (f.search) parts.push(`«${f.search}»`);
  return parts.join(' · ');
}
