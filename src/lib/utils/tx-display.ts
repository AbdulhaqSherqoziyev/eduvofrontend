/**
 * Display mapping for ledger rows written before the cash desk existed.
 *
 * `Transaction.method` and `.category` are free-text columns and production
 * holds a mix: PaymentService wrote raw enum values, so the cashier's screen
 * literally reads "CASH" today (§0.11). New rows already arrive in uzbek; old
 * ones are mapped here rather than migrated, so no historical row is rewritten.
 */

const METHODS: Record<string, string> = {
  CASH: 'Naqd',
  CARD: 'Karta',
  BANK: 'Bank',
  CLICK: 'Click',
  PAYME: 'Payme',
  DISCOUNT: 'Chegirma',
};

const CATEGORIES: Record<string, string> = {
  Tolov: "O'quvchi to'lovi",
  Storno: "To'g'rilash",
};

/** Enum value or uzbek label in, "Naqd" out. */
export function methodLabel(raw: string): string {
  const key = (raw ?? '').trim();
  return METHODS[key.toUpperCase()] ?? key;
}

/** Lowercase form used under an amount: "naqd · foydaga kirmaydi". */
export function methodWord(raw: string): string {
  return methodLabel(raw).toLocaleLowerCase('uz');
}

export function categoryLabel(raw: string): string {
  const key = (raw ?? '').trim();
  return CATEGORIES[key] ?? key;
}

/** The one name the app compares against, after legacy mapping. */
export const SYS_CATEGORY = {
  PAYMENT: "O'quvchi to'lovi",
  DAY_DIFF: 'Kassa farqi',
  TRANSFER: 'Pul topshirish',
  CORRECTION: "To'g'rilash",
} as const;

/**
 * "Dilnoza Rasulova (+998901234567)" -> "Dilnoza Rasulova".
 *
 * The phone answers no question a money row raises, but it would put a
 * colleague's private number on screen every time the entry is opened (§A.7).
 * The backend keeps the full string for the audit trail.
 */
export function personName(raw: string): string {
  const name = (raw ?? '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  return name || '—';
}

/** "2026-08-16T…" -> "16.08" — the short stamp used inside row hints. */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** `YYYY-MM-DD` in local time — what every `<input type="date">` here speaks. */
export function isoDay(date: Date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Digits only, so "3 500 000" and a stray letter both come back as 3500000. */
export function parseAmount(raw: string): number {
  const digits = (raw ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}
