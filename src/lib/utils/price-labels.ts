import { formatNumber, formatSom } from './format';
import { currentPeriod, monthName, shiftPeriod } from './payroll-labels';
import type { EnrollmentCurrentInvoice, PriceAppliedTo } from '../types/student';

/**
 * O'quvchining alohida oylik narxi — yagona lug'at (spec individual-narx §0.1).
 *
 * Matnlar komponentlarda emas, shu yerda: Sevara taqiqlangan so'zlar
 * ro'yxatini (§0.1) bitta faylda tekshira olsin. Yagona istisno —
 * `DISCOUNT_METHOD_LABEL`: bu mavjud to'lov usuli tugmasining nomi (§5),
 * admin uni boshqa so'z bilan topa olmaydi.
 *
 * Oy nomlari `monthName()` dan (koddagi rasmiy imlo: "Oktabr"), hech biri
 * qattiq yozilmaydi.
 */

export const PRICE_DIALOG_TITLE = 'Oylik narx';
export const PRICE_BLOCK_LABEL = 'OYLIK NARX';
export const CUSTOM_BADGE = 'alohida';
export const CUSTOM_BADGE_HINT = "Bu o'quvchi uchun guruh narxidan boshqa narx belgilangan.";
export const AMOUNT_LABEL = "Shu o'quvchi uchun oylik narx";
export const AMOUNT_PLACEHOLDER = 'Masalan: 265 000';
export const FREE_LABEL = 'Bepul';
export const PER_MONTH = ' / oy';

export const EDIT_PRICE = "Narxni o'zgartirish";
export const editPriceAria = (groupName: string) => `${groupName} — oylik narxni o'zgartirish`;
/** "Guruh narxi: 285 000" — "so'm"siz (Sevara matni). */
export const groupPriceLine = (groupPrice: number) => `Guruh narxi: ${formatNumber(groupPrice)}`;

export const NO_GROUPS =
  "Guruhga biriktirilmagan. O'quvchilar ro'yxatida «Tahrirlash» orqali guruh tanlang.";

/* ── Dialog, 1-qadam ─────────────────────────────────────────── */

export const CHOICE_GROUP = 'Guruh narxi';
export const CHOICE_CUSTOM = 'Boshqa narx';
export const RESET_TO_GROUP = 'Guruh narxiga qaytarish';

export const BTN_CANCEL = 'Bekor qilish';
export const BTN_CONTINUE = 'Davom etish';
export const BTN_BACK = 'Orqaga';
export const BTN_SAVE = 'Saqlash';
export const BTN_SAVING = 'Saqlanmoqda...';
export const BTN_RETRY = 'Qayta urinish';
export const BTN_CLOSE = 'Yopish';
export const BTN_FIX_THOUSANDS = 'Ha, tuzatish';

/** §2.2-B */
export const FREE_HINT = "Bepul: bu guruh uchun o'quvchidan to'lov olinmaydi.";
/** §2.2-C — yozish paytidagi taklif. */
export const thousandsQuestion = (v: number) => `${formatSom(v * 1000)} demoqchimisiz?`;
/** §2.2-D */
export const SAME_AS_GROUP = 'Bu guruh narxi bilan bir xil.';
/** §2.2-E */
export const FAR_FROM_GROUP = "Bu narx guruh narxidan ancha farq qiladi. To'g'rimi?";

/** §2.2-F — "Guruh narxidan 20 000 so'm kam / ko'p". */
export function priceDiffLine(value: number, groupPrice: number): string {
  const diff = formatSom(Math.abs(value - groupPrice));
  return value < groupPrice ? `Guruh narxidan ${diff} kam` : `Guruh narxidan ${diff} ko'p`;
}

/** §2.2-E sharti (Sevara tuzatishi: ×1.5, har qanday yuqoriroq narx emas). */
export function isFarFromGroup(value: number, groupPrice: number): boolean {
  return groupPrice > 0 && (value < groupPrice / 2 || value > groupPrice * 1.5);
}

/* ── §2.3 Validatsiya ─────────────────────────────────────────── */

export const ERR_EMPTY = 'Summani kiriting yoki «Guruh narxi»ni tanlang.';
export const errThousands = (v: number) => `${formatSom(v * 1000)} demoqchimisiz? Summani to'liq kiriting.`;
export const ERR_TOO_BIG = 'Summa juda katta. Tekshirib qayta kiriting.';
export const PRICE_MAX = 100_000_000;

/* ── §2.5 Tasdiq ─────────────────────────────────────────────── */

/**
 * Tasdiq bosqichidagi bashorat. Backend bilan bir xil savol:
 * `currentInvoice.hasPayment` — PATCH ham aynan shunga qarab CURRENT/NEXT
 * tanlaydi; bu oy hisobi hali yo'q (`null`) bo'lsa ham CURRENT (u yangi narx
 * bilan yoziladi). Natija matni esa doim javobdagi `appliedTo` dan.
 */
export type PricePrediction = 'CURRENT' | 'NEXT_PAID' | 'UNKNOWN';

export function predictApplied(ci: EnrollmentCurrentInvoice | null | undefined): PricePrediction {
  if (ci === undefined) return 'UNKNOWN';
  return ci?.hasPayment ? 'NEXT_PAID' : 'CURRENT';
}

const lower = (period: string) => monthName(period).toLowerCase();

/** "Narx 265 000 → 285 000 so'm (guruh narxi)." — birinchi, katta qator. */
export function confirmHeadline(oldPrice: number, newPrice: number, toGroup: boolean): string {
  const tail = toGroup ? ' (guruh narxi)' : '';
  if (newPrice === 0) return `Narx ${formatNumber(oldPrice)} so'm → bepul.`;
  if (oldPrice === 0) return `Narx bepul → ${formatNumber(newPrice)} so'm${tail}.`;
  return `Narx ${formatNumber(oldPrice)} → ${formatNumber(newPrice)} so'm${tail}.`;
}

/** Tasdiq info-bloki (§2.5 jadvali, Sevara tuzatishlari bilan). */
export function confirmNote(
  prediction: PricePrediction,
  newPrice: number,
  ci: EnrollmentCurrentInvoice | null | undefined,
): string {
  const cur = ci?.period ?? currentPeriod();
  const Cur = monthName(cur);
  const next = lower(shiftPeriod(cur, 1));
  const free = newPrice === 0;

  // Bu oy hisobi hali yozilmagan: u yangi narx bilan yoziladi (Sevara, yakuniy).
  if (ci === null) {
    return free
      ? `${Cur} hisobi hali yozilmagan, ${lower(cur)}dan boshlab to'lov olinmaydi.`
      : `${Cur} hisobi hali yozilmagan, u ${formatSom(newPrice)} bilan yoziladi.`;
  }

  switch (prediction) {
    case 'CURRENT':
      return free
        ? `${Cur} hisobiga hali to'lov kirmagan, shuning uchun ${lower(cur)}dan boshlab bu o'quvchidan to'lov olinmaydi.`
        : `${Cur} hisobiga hali to'lov kirmagan, shuning uchun u ham ${formatSom(newPrice)}ga yangilanadi.`;
    case 'NEXT_PAID': {
      if (free) return `${Cur} hisobiga to'lov kirgan, shuning uchun ${next}dan boshlab to'lov olinmaydi. ${Cur} hisobi o'zgarmaydi.`;
      // Shu guruh qatori bu oy yozilmagan bo'lsa (0), "0 so'm" chizilmaydi.
      const amount = ci && ci.amount > 0 ? ` (bu guruh uchun ${formatSom(ci.amount)})` : '';
      return `${Cur} hisobiga to'lov kirgan, shuning uchun yangi narx ${next}dan qo'llanadi. ${Cur} hisobi o'zgarmaydi${amount}.`;
    }
    default:
      return free
        ? `${Cur} hisobiga hali to'lov kirmagan bo'lsa, ${lower(cur)}dan boshlab to'lov olinmaydi. To'lov kirgan bo'lsa, ${next}dan boshlab to'lov olinmaydi.`
        : `${Cur} hisobiga hali to'lov kirmagan bo'lsa, u ham yangilanadi. To'lov kirgan bo'lsa, yangi narx ${next}dan qo'llanadi.`;
  }
}

/* ── §2.6 Natija ─────────────────────────────────────────────── */

/**
 * Natija matni — faqat javobdagi `appliedTo`/`period` dan. "To'lov kirgan"
 * sababi faqat oldindan ma'lum bo'lsa (`hasPayment`) aytiladi, to'qilmaydi.
 */
export function resultLine(
  appliedTo: PriceAppliedTo,
  period: string,
  newPrice: number,
  ci: EnrollmentCurrentInvoice | null | undefined,
  /** Invoice's new TOTAL after a CURRENT_PERIOD rewrite; null = not rewritten / not sent. */
  invoiceAmount?: number | null,
): string {
  const Month = monthName(period);
  const month = lower(period);
  const free = newPrice === 0;

  if (appliedTo === 'CURRENT_PERIOD') {
    if (free) return `Saqlandi. ${Month}dan boshlab to'lov olinmaydi.`;
    // Hisob oldin ham yo'q edi, saqlashda ham yozilmadi — yangilangan hisob yo'q.
    if (!ci && invoiceAmount == null) return `Saqlandi. Yangi narx ${month}dan qo'llanadi.`;
    // Boshqa guruh qatorlari ham bo'lsa, jami summa shu guruh narxidan farq qiladi.
    if (invoiceAmount != null && invoiceAmount !== newPrice) {
      return `Saqlandi. ${Month} hisobi yangilandi: shu guruh uchun ${formatSom(newPrice)}, jami ${formatSom(invoiceAmount)}.`;
    }
    return `Saqlandi. ${Month} hisobi ${formatSom(newPrice)}ga yangilandi.`;
  }
  if (free) return `Saqlandi. ${Month}dan boshlab to'lov olinmaydi.`;
  if (ci?.hasPayment) {
    const prev = monthName(ci.period);
    return `Saqlandi. ${prev} hisobiga to'lov kirgan, shuning uchun yangi narx ${month}dan qo'llanadi.`;
  }
  return `Saqlandi. Yangi narx ${month}dan qo'llanadi.`;
}

/* ── §5 Joriy oy hisobini qo'lda tuzatish ─────────────────────── */

/** Mavjud to'lov usuli tugmasining nomi (`PAYMENT_METHODS`) — yagona istisno. */
export const DISCOUNT_METHOD_LABEL = 'Chegirma';

export const fixInvoiceSummary = (period: string) => `${monthName(period)} hisobini ham tuzatish kerakmi?`;

/**
 * `AcceptPaymentDialog` fills the amount with the WHOLE debt — the admin must
 * overwrite it with the difference, so the text names that step and the sum.
 */
export function fixInvoiceBody(period: string, lineAmount: number, diff: number): string {
  return (
    `${monthName(period)} hisobida bu guruh uchun ${formatSom(lineAmount)} yozilgan. ` +
    `Farqni yopish: To'lovlar bo'limi → shu hisob qatoridagi «+ Qabul qilish» → summani ${formatSom(diff)} qiling → ` +
    `«${DISCOUNT_METHOD_LABEL}» usuli. Kassaga pul sifatida yozilmaydi.`
  );
}

export const FIX_INVOICE_LINK = "To'lovlar bo'limiga o'tish";

/** §2.7 */
export const SAVE_FAILED = "Narx saqlanmadi. Internetni tekshirib, qayta urinib ko'ring. Hozirgi narx o'zgarmadi.";

/* ── §3, §4 ──────────────────────────────────────────────────── */

export const ROSTER_PRICE_HEAD = 'OYLIK NARX';
export const ROSTER_EMPTY_HINT =
  "Bu guruhda hali o'quvchilar yo'q. O'quvchilar bo'limida «O'quvchi qo'shish» orqali qo'shing.";

export const customPriceCountNote = (n: number) =>
  `Bu guruhda ${n} o'quvchining alohida narxi bor. Ularning narxi o'zgarmaydi.`;
export const SEE_LIST = "Ro'yxatni ko'rish";
