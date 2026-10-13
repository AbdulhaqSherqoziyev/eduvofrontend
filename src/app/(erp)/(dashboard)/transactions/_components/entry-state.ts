import { isoDay } from '@/lib/utils/tx-display';
import type { Transaction } from '@/lib/types/transaction';

/** What the two entry dialogs hold while the person is typing (§B.1, §E.1). */
export interface EntryDraft {
  type: 'INCOME' | 'EXPENSE';
  /** Raw digits — see AmountField. */
  amount: string;
  categoryId: string;
  method: 'CASH' | 'CARD';
  /** `YYYY-MM-DD`, native picker. */
  date: string;
  party: string;
  note: string;
}

export interface DraftErrors {
  amount?: string;
  category?: string;
  date?: string;
}

export function emptyDraft(type: 'INCOME' | 'EXPENSE'): EntryDraft {
  return { type, amount: '', categoryId: '', method: 'CASH', date: isoDay(), party: '', note: '' };
}

/** Reopen an own PENDING/RETURNED row for editing (§C.2). */
export function draftFromEntry(tx: Transaction): EntryDraft {
  return {
    type: tx.type,
    amount: String(Math.round(tx.amount)),
    categoryId: tx.categoryId ?? '',
    method: /karta|card/i.test(tx.method) ? 'CARD' : 'CASH',
    date: isoDay(new Date(tx.date)),
    party: tx.party,
    note: tx.note,
  };
}

/**
 * Checked on "Davom etish", never while typing: a form that turns red at every
 * keystroke rushes the person filling it in, which is the opposite of what a
 * money entry needs (§B.6).
 */
export function validateDraft(draft: EntryDraft, opts: { requireCategory?: boolean } = {}): DraftErrors {
  const errors: DraftErrors = {};
  if (!Number(draft.amount || 0)) errors.amount = 'Summani kiriting.';
  if (opts.requireCategory !== false && !draft.categoryId) errors.category = 'Kategoriyani tanlang.';
  if (draft.date > isoDay()) errors.date = 'Kelajak sanasiga yozuv kiritib bo\'lmaydi.';
  return errors;
}

export function hasErrors(errors: DraftErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** True once anything worth losing has been typed (§B.1 close warning). */
export function isDirty(draft: EntryDraft): boolean {
  return !!(draft.amount || draft.categoryId || draft.party || draft.note);
}

/**
 * `YYYY-MM-DD` from the picker to a timestamp the server will accept.
 *
 * Today is sent as "now" rather than as noon: the backend rejects a future
 * date, and a cashier writing an expense at 09:00 would otherwise be told
 * their own entry is in the future.
 */
export function entryDateIso(day: string): string {
  if (day === isoDay()) return new Date().toISOString();
  return new Date(`${day}T12:00:00`).toISOString();
}

const DAYS_90 = 90 * 24 * 60 * 60 * 1000;

/** Not a block — just a statement of which day the entry will land on (§B.1). */
export function backdatedNote(date: string): string {
  const picked = new Date(`${date}T00:00:00`);
  if (Number.isNaN(picked.getTime()) || Date.now() - picked.getTime() < DAYS_90) return '';
  const dd = String(picked.getDate()).padStart(2, '0');
  const mm = String(picked.getMonth() + 1).padStart(2, '0');
  return `Bu yozuv ${dd}.${mm}.${picked.getFullYear()} sanasiga tushadi.`;
}

/**
 * The §B.6 table, in one place.
 *
 * Never "Xatolik yuz berdi": a message the cashier cannot act on leaves them
 * guessing whether the money was written or not, and the honest answer to that
 * question is the entire point of these strings.
 */
export function saveErrorMessage(error: unknown): string {
  const res = (error as { response?: { status?: number; data?: { message?: string | string[] } } })?.response;
  const status = res?.status ?? 0;
  if (status === 403) return "Bu amal uchun huquqingiz yo'q.";
  if (status === 409) return 'Bu yozuv allaqachon saqlangan.';
  if (status === 400) {
    const msg = res?.data?.message;
    const first = Array.isArray(msg) ? msg[0] : msg;
    return first || "Ma'lumotda xatolik bor — tekshirib qayta urinib ko'ring.";
  }
  return "Server javob bermadi. Yozuv saqlanmadi — qayta urinib ko'ring.";
}

/** Idempotency key: a retry after a lost response must not pay twice (§B.7). */
export function newClientRef(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `ref-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
