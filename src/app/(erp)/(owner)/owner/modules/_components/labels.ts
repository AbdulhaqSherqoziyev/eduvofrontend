import { formatNumber } from '@/lib/utils/format';
import type { OwnerModule } from '@/lib/api/owner-modules';

/** Every user-facing string of the OWNER catalogue screen (Dilnoza's spec §C). */

export const NOT_ENABLED = 'Hali hech qaysi markazda yoqilmagan';

export function enabledCount(n: number): string {
  return `Yoqilgan: ${n} markaz`;
}

export function revenuePerMonth(value: number): string {
  return `${formatNumber(value)} so'm/oy`;
}

/**
 * "Yoqilgan: 23 markaz · 2 070 000 so'm/oy" — the impact line.
 * Core modules stop at the center count: the card already says the module has
 * no price, so repeating "0 so'm/oy" carries no information and reads as a bug
 * (Sarvar's call, 2026-07-26 — supersedes the literal §C.2.4 format for core).
 */
export function usageText(m: Pick<OwnerModule, 'tenantCount' | 'monthlyRevenue' | 'isCore'>): string {
  if (m.tenantCount === 0) return NOT_ENABLED;
  if (m.isCore) return enabledCount(m.tenantCount);
  return `${enabledCount(m.tenantCount)} · ${revenuePerMonth(m.monthlyRevenue)}`;
}

/**
 * R1 (release blocker): a catalogue price change does NOT touch existing
 * subscriptions — their monthly bill comes from `customMonthlyFee ?? plan.monthlyFee`.
 */
export function applyScopeText(tenantCount: number): string {
  const first = "Yangi narx faqat bundan keyin yoqadigan markazlarga qo'llanadi.";
  if (tenantCount === 0) return first;
  return `${first} Hozir yoqilgan ${tenantCount} markazning to'lovi o'zgarmaydi.`;
}

export const GUARD_10X = "Kiritilgan narx eski narxdan 10 barobar farq qiladi. Tekshirib ko'ring.";

export const CORE_TITLE = 'Asosiy modul — narxsiz';
export const CORE_HINT = "Har bir markazda doim yoqilgan, narxi yo'q.";

export const PRICE_EMPTY = 'Narxni kiriting.';
export const NAME_EMPTY = 'Nomni kiriting.';
export const BENEFIT_EMPTY = 'Foyda matnini kiriting.';

export const TEXTS_SUMMARY = 'Matnlarni tahrirlash (nom, foyda tavsifi)';
export const TEXTS_HINT = "Bu matnlar landing sahifada va mijoz kabinetida ko'rinadi.";

export const ON_SALE = 'Sotuvda';
export const RETIRED = 'Sotuvdan olingan';
export const RETIRE_QUESTION = 'Sotuvdan olinsinmi?';

export function retireBody(tenantCount: number): string {
  // "…0 ta markazda ishlashda davom etadi" reads broken, so zero gets its own
  // sentence (Sarvar's wording, 2026-07-26).
  if (tenantCount === 0) {
    return 'Bu modul hali hech qaysi markazda yoqilmagan. Sotuvdan olinsa, yangi markazlar uni tanlay olmaydi.';
  }
  return `Yangi markazlar tanlay olmaydi. Hozir yoqilgan ${tenantCount} ta markazda ishlashda davom etadi.`;
}

export const RETIRED_ROW = 'Sotuvdan olindi. Yangi markazlar tanlay olmaydi.';
export const RESTORED_ROW = 'Sotuvga qaytarildi.';

export const SAVE_ERROR = "Saqlab bo'lmadi. Qayta urinib ko'ring.";
export const SAVED_ROW = 'Saqlandi ✓';
export const NO_CHANGES = "O'zgarish yo'q";
export const SAVE_TEXTS = "O'zgarishlarni saqlash";
export const SAVING = 'Saqlanmoqda…';

export function savePriceLabel(from: number, to: number): string {
  return `${formatNumber(from)} → ${formatNumber(to)} so'm saqlash`;
}

export function lastChanged(date: string): string {
  return `Oxirgi o'zgarish: ${date}`;
}

export function requiresText(names: string[]): string {
  return `Ishlashi uchun kerak: ${names.join(', ')}`;
}
