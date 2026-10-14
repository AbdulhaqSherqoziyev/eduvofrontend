/** Owner-mock formatting + Uzbek labels for statuses and API error codes (contract §12–§13). */
import type { PillTone } from '@/components/shared/status-pill';
import type { MockMoney } from '@/lib/types/owner-mock';

const EXP: Record<string, number> = { UZS: 0, USD: 2, EUR: 2 };
const group = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** "79 000 UZS", "$6.99", "€6.49" (amountMinor; UZS exponent 0). */
export function fmtMoney(m: MockMoney | null | undefined): string {
  if (!m) return '—';
  const major = m.amountMinor / 10 ** (EXP[m.currency] ?? 2);
  if (m.currency === 'UZS') return `${group(major)} UZS`;
  if (m.currency === 'USD') return `$${major.toFixed(2)}`;
  if (m.currency === 'EUR') return `€${major.toFixed(2)}`;
  return `${major.toFixed(2)} ${m.currency}`;
}
export const fmtMoneyList = (list: MockMoney[] | undefined) => (list?.length ? list.map(fmtMoney).join(' · ') : '—');

const pad = (n: number) => String(n).padStart(2, '0');
/** "15.10.2026 14:30" (local time). */
export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export const ORDER_STATUS: Record<string, { label: string; tone: PillTone }> = {
  PENDING: { label: 'Kutilmoqda', tone: 'warning' },
  PAID: { label: "To'langan", tone: 'success' },
  FAILED: { label: 'Rad etilgan', tone: 'danger' },
  CANCELLED: { label: 'Bekor qilingan', tone: 'muted' },
  REFUNDED: { label: 'Qaytarilgan', tone: 'primary' },
};
export const LEARNER_STATUS: Record<string, { label: string; tone: PillTone }> = {
  ACTIVE: { label: 'Faol', tone: 'success' },
  LOCKED: { label: 'Bloklangan', tone: 'danger' },
  DELETION_PENDING: { label: "O'chirilmoqda", tone: 'warning' },
  DELETED: { label: "O'chirilgan", tone: 'muted' },
};
export const ATTEMPT_STATUS: Record<string, string> = {
  in_progress: 'Jarayonda', grading: 'Baholanmoqda', completed: 'Yakunlangan', expired: "Muddati o'tgan", cancelled: 'Bekor qilingan',
};
export const PROVIDER: Record<string, string> = { manual: "Qo'lda (o'tkazma)", paddle: 'Paddle' };
export const KIND: Record<string, string> = { full: "To'liq mock", section: "Bo'lim", unlimited: 'Cheksiz', bundle: 'Paket' };
export const EXAM: Record<string, string> = { ielts: 'IELTS', sat: 'SAT' };
export const TOPIC: Record<string, string> = { exams: 'Imtihonlar', payments: "To'lovlar", account: 'Akkaunt', technical: 'Texnik', other: 'Boshqa' };
export const FAILURE: Record<string, string> = {
  DECLINED: 'Rad etildi', EXPIRED: "Muddati o'tdi", AMOUNT_MISMATCH: 'Summa mos emas', PROVIDER_ERROR: 'Provayder xatosi',
};
export const LEDGER_REASON: Record<string, string> = {
  GRANT_ORDER: 'Xarid', ADMIN_ADJUST: 'Owner berdi', ADMIN_REVOKE: 'Owner oldi', CONSUME_ATTEMPT: 'Urinishga sarflandi',
  REFUND_AUTO: 'Avto-qaytarish', REFUND_REVOKE: 'Refund — olib qo‘yildi', FREE_SECTION: "Bepul bo'lim", GRANT_PROMO: 'Promo',
};

/** Product line: "IELTS · Paket · 5 ta". */
export function productLabel(p: { exam?: string; kind?: string; qty?: number } | undefined): string {
  if (!p) return '—';
  const parts = [EXAM[p.exam ?? ''] ?? p.exam, KIND[p.kind ?? ''] ?? p.kind];
  if (p.kind === 'bundle' && p.qty) parts.push(`${p.qty} ta`);
  return parts.filter(Boolean).join(' · ');
}

type ErrBody = { error?: string; expected?: number; available?: number; unknown?: string[]; retryAfterSec?: number; fields?: Array<{ field: string; code: string }> };
const CODE_MSG: Record<string, string> = {
  NOT_MANUAL_ORDER: "Bu buyurtma qo'lda to'lov emas — Paddle to'lovi faqat webhook orqali tasdiqlanadi.",
  ORDER_NOT_PENDING: "Buyurtma holati allaqachon o'zgargan (to'langan yoki qaytarilgan). Sahifani yangilang.",
  USE_PROVIDER_REFUND: "Paddle orqali to'langan buyurtma Paddle panelida qaytariladi — webhook kreditlarni o'zi oladi.",
  ORDER_NOT_PAID: "Faqat to'langan buyurtmani qaytarish mumkin.",
  ALREADY_LOCKED: "O'quvchi allaqachon bloklangan.",
  NOT_LOCKED: "O'quvchi bloklanmagan.",
  PROMO_CODE_TAKEN: 'Bunday promo kod allaqachon bor.',
  NOT_FOUND: 'Topilmadi — sahifani yangilang.',
  RATE_LIMITED: "Juda ko'p so'rov. Birozdan keyin urinib ko'ring.",
  MOCK_DISABLED: "Mock sayti hozir o'chirilgan.",
  FORBIDDEN: "Bu bo'limga ruxsatingiz yo'q (mock.manage).",
};
const FIELD: Record<string, string> = {
  code: 'Kod', percentOff: 'Chegirma %', skus: 'Mahsulotlar', maxRedemptions: 'Limit', perLearnerLimit: "O'quvchi limiti",
  validFrom: 'Boshlanish', validTo: 'Tugash', providerDiscountId: 'Paddle discount ID', note: 'Izoh', reason: 'Sabab', qty: 'Soni',
  validityMonths: 'Amal qilish muddati', amountMinor: 'Summa', providerRef: 'Provayder ID',
};

/** API error → one Uzbek sentence (codes from contract §13; never the English `message`). */
export function mockErrorText(e: unknown, fallback = "Amalni bajarib bo'lmadi. Qayta urinib ko'ring."): string {
  const res = (e as { response?: { status?: number; data?: ErrBody } })?.response;
  if (!res) return "Server bilan aloqa yo'q. Internetni tekshiring.";
  const d = res.data ?? {};
  if (d.error === 'AMOUNT_MISMATCH') return `Summa buyurtmaga mos emas. Kutilgan: ${d.expected ?? '—'} (minor birlikda).`;
  if (d.error === 'NOT_ENOUGH_CREDITS') return `Yetarli kredit yo'q. Hozir olish mumkin: ${d.available ?? 0} ta.`;
  if (d.error === 'VALIDATION_FAILED') {
    if (d.unknown?.length) return `Noma'lum mahsulot (sku): ${d.unknown.join(', ')}`;
    const f = d.fields?.[0];
    if (f) return `${FIELD[f.field] ?? f.field}: qiymat noto'g'ri (${f.code}).`;
  }
  if (res.status === 403) return CODE_MSG.FORBIDDEN;
  if (d.error && CODE_MSG[d.error]) return CODE_MSG[d.error];
  return fallback;
}
