/**
 * Backend error code → Uzbek text (contract §0.4: the UI text comes from `error`, never `message`).
 * Texts that the design shows are copied from it; the rest follow the design's tone.
 */
import { AdminApiError } from './http';

const TEXT: Record<string, string> = {
  NETWORK: "Tarmoq xatosi. Qayta urinib ko'ring.",
  INTERNAL: "Server xatosi. Qayta urinib ko'ring.",
  RATE_LIMITED: "Juda ko'p so'rov. Birozdan so'ng qayta urinib ko'ring.",
  FORBIDDEN: "Bu amal rolingizga ruxsat etilmagan. Owner'ga murojaat qiling.",
  NOT_FOUND: "Topilmadi — o'chirilgan bo'lishi mumkin. Sahifani yangilang.",
  VALIDATION_FAILED: "Maydonlarni tekshiring.",
  AMOUNT_MISMATCH: 'Summa mos emas',
  ORDER_NOT_PENDING: "Buyurtma holati o'zgargan. Sahifani yangilang.",
  NOT_MANUAL_ORDER: "Bu buyurtma mahalliy o'tkazma emas.",
  USE_PROVIDER_REFUND: 'Qaytarish faqat Paddle panelidan.',
  NOT_ENOUGH_CREDITS: "O'quvchida bunchalik kredit yo'q. Sahifani yangilang.",
  ALREADY_LOCKED: 'Hisob allaqachon bloklangan.',
  LEARNER_NOT_ACTIVE: "O'quvchi hisobi faol emas.",
  JOB_NOT_REGRADABLE: 'Baholangan — qayta baholash bir xil natija beradi',
  NOTHING_TO_REGRADE: "Qayta baholanadigan topshiriq yo'q.",
  ALREADY_REFUNDED: 'Kredit allaqachon qaytarilgan.',
  NOTHING_TO_REFUND: "Qaytariladigan kredit yo'q.",
  PRICE_CHANGED: "Narx boshqa admin tomonidan o'zgartirilgan. Sahifani yangilang.",
  PADDLE_SYNC_FAILED: "Paddle bilan sinxronlab bo'lmadi. Narx o'zgarmadi. Birozdan so'ng qayta urinib ko'ring.",
  EXAM_NOT_READY: "Bu imtihon o'quvchi saytida hali tayyor emas.",
  ALREADY_ARCHIVED: 'Test allaqachon arxivda.',
  NOT_ARCHIVED: 'Test arxivda emas.',
  NOT_PUBLISHED: 'Test nashr qilinmagan.',
  TEST_INVALID: "Testda xatolar bor — nashr qilib bo'lmaydi. Xatolarni tuzatib, qayta import qiling.",
  BAD_JSON: "JSON fayl o'qilmadi.",
  ZIP_INVALID: "Zip fayl o'qilmadi.",
  FAMILY_MISMATCH: 'JSON boshqa imtihon oilasiga tegishli.',
  IMPORT_HAS_ERRORS: "Xatolar tuzatilmaguncha import qilib bo'lmaydi.",
  STAGE_EXPIRED: "Yuklangan fayllar muddati o'tdi. Qayta yuklang.",
  FILE_TOO_LARGE: 'Fayl juda katta.',
  FILE_TYPE_NOT_ALLOWED: 'Fayl turi ruxsat etilmagan.',
  EXPORT_TOO_LARGE: "Eksport juda katta. Filtrni toraytiring.",
  PROMO_CODE_TAKEN: 'Bu kod band.',
  ALREADY_OWNER: "Bu email platforma egasiniki — taklif shart emas.",
  EMAIL_IN_USE: "Bu email boshqa ERP xodimiga tegishli. Boshqa email kiriting.",
  ADMIN_EXISTS: 'Bu admin allaqachon bor.',
  NOT_INVITED: 'Admin taklif holatida emas.',
  CANNOT_CHANGE_SELF: "O'zingizni o'zgartira olmaysiz.",
  LAST_OWNER: "Oxirgi faol Owner'ni o'zgartirib bo'lmaydi. Avval boshqa adminni Owner qiling.",
  PLATFORM_OWNER_FIXED: "Platforma Owner'ini o'zgartirib bo'lmaydi.",
  INVITE_INVALID: "Havola yaroqsiz yoki ishlatilgan. Parol o'rnatgan bo'lsangiz — kiring, aks holda Owner'dan yangi taklif so'rang.",
  INVITE_EXPIRED: "Taklif muddati o'tgan. Owner'dan yangisini so'rang.",
};

export function errCode(e: unknown): string {
  if (e instanceof AdminApiError) return e.code;
  return 'NETWORK';
}

export function errText(e: unknown, fallback = "Saqlanmadi. Qayta urinib ko'ring."): string {
  const code = errCode(e);
  return TEXT[code] ?? fallback;
}

/** Text for a failed load (ErrorState): never "Saqlanmadi". */
export const loadErrText = (e: unknown, fallback = "Qayta urinib ko'ring.") => errText(e, fallback);

export const isForbidden = (e: unknown) => e instanceof AdminApiError && e.status === 403;
export const isNotFound = (e: unknown) => e instanceof AdminApiError && e.status === 404;
