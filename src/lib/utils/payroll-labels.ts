import { formatNumber, formatSom } from './format';
import type { CombineMode, RuleView, UiScheme } from '../types/payroll';

/**
 * Ish haqi blokining yagona lug'ati (spec §0.11, §F.1).
 *
 * Matnlar shu yerda turadi, komponentlarda emas: bir xil jumla to'rt ekranda
 * chiqadi va ular ajralib ketsa, Sevaraning taqiqlangan so'zlar ro'yxati
 * bo'yicha tekshiruv (§F.3) bitta faylni emas, butun daraxtni qidirishga
 * aylanadi.
 */

const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

/** "2026-08" -> "Avgust". */
export function monthName(period: string): string {
  const month = Number(period.split('-')[1]);
  return MONTHS[month - 1] ?? period;
}

/** "2026-08" -> "Avgust 2026". */
export function monthLabel(period: string): string {
  return `${monthName(period)} ${period.split('-')[0]}`;
}

/** "2026-09" -> "1-sentabrdan" — qoida qachondan kuchga kirishi (§A.6). */
export function monthFromDay(period: string): string {
  return `1-${monthName(period).toLowerCase()}dan`;
}

/** ISO sana -> "5-sentabrda" (§C.4 dagi "O'tgan oy hisobi ... tasdiqlangan"). */
export function dayInMonth(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}-${MONTHS[d.getMonth()].toLowerCase()}da`;
}

/** ISO sana -> "16.08" (qoida shu oy ichida o'zgargan sanasi, §C.5). */
export function shortDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** "2026-08" + 1 -> "2026-09". */
export function shiftPeriod(period: string, delta: number): string {
  const [year, month] = period.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function currentPeriod(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * `0 so'm` HECH QACHON chizilmaydi [S5.3].
 *
 * `formatSom(0)` butun blokda taqiqlangan: nol — javob emas, hali to'ldirilmagan
 * hisob, va "0 so'm" ni o'qigan ustoz uni yakuniy raqam deb tushunadi.
 */
export function somOrDash(value: number | null | undefined): string {
  if (!value) return '—';
  return formatSom(value);
}

/** Ishorali summa: `+ 120 000 so'm` / `− 450 000 so'm`. Nolda `—`. */
export function somSigned(value: number): string {
  if (!value) return '—';
  return formatSom(value, { sign: true });
}

interface SchemeMeta {
  label: string;
  hint: string;
}

/**
 * Besh rejim nomi va izohi — matn spec §A.3 jadvalidan AYNAN olingan.
 *
 * `GUARANTEE` nomida `+` yo'q [SV4]: avvalgi `Kafolatlangan oylik + foiz` dagi
 * plyus aynan "qo'shiladi" deb o'qilardi, ya'ni blokdagi eng qimmat xatoni
 * (SUM ni tushunmay tanlash) nomning o'zi tug'dirardi. Endi 2 va 3 farqi bitta
 * so'zda — yoki / va — va har ikkalasining izohida inkor bor.
 */
export const SCHEME_META: Record<UiScheme, SchemeMeta> = {
  BASE_ONLY: {
    label: 'Faqat tan oylik',
    hint: "Har oy bir xil summa. Tushumga bog'liq emas.",
  },
  GUARANTEE: {
    label: 'Oylik yoki foiz — kattasi',
    hint: "Oylik va foizdan qaysi biri katta bo'lsa — o'shanisi beriladi. Ikkalasi qo'shilmaydi.",
  },
  SUM: {
    label: "Oylik va foiz qo'shiladi",
    hint: "Ikkalasi ham to'liq beriladi: oylik ustiga foiz.",
  },
  PERCENT_ONLY: {
    label: 'Faqat foiz',
    hint: "Tan oylik yo'q. Tushgan pulning belgilangan qismi.",
  },
  PER_LESSON: {
    label: 'Darsbay',
    hint: "Har o'tilgan dars uchun stavka. Foiz qo'shilmaydi.",
  },
};

export const SCHEME_ORDER: UiScheme[] = ['BASE_ONLY', 'GUARANTEE', 'SUM', 'PERCENT_ONLY', 'PER_LESSON'];

/** Rejim almashganda qaysi maydonlar ko'rinadi (§A.3). */
export const SCHEME_FIELDS: Record<UiScheme, { base: boolean; percent: boolean; perLesson: boolean }> = {
  BASE_ONLY: { base: true, percent: false, perLesson: false },
  GUARANTEE: { base: true, percent: true, perLesson: false },
  SUM: { base: true, percent: true, perLesson: false },
  PERCENT_ONLY: { base: false, percent: true, perLesson: false },
  PER_LESSON: { base: false, percent: false, perLesson: true },
};

/** Saqlangan qoidani forma rejimiga o'girish. */
export function schemeOfRule(rule: {
  baseSalary: number;
  revenuePercent: number;
  perLessonRate: number;
  combineMode: CombineMode;
}): UiScheme {
  if (rule.perLessonRate > 0) return 'PER_LESSON';
  if (rule.revenuePercent <= 0) return 'BASE_ONLY';
  if (rule.baseSalary <= 0) return 'PERCENT_ONLY';
  return rule.combineMode === 'SUM' ? 'SUM' : 'GUARANTEE';
}

/** Backend `mode` (`GUARANTEE`/`SUM`/`PER_LESSON`) -> ekrandagi rejim nomi. */
export function modeLabel(mode: string): string {
  if (mode === 'PER_LESSON') return SCHEME_META.PER_LESSON.label;
  return mode === 'SUM' ? SCHEME_META.SUM.label : SCHEME_META.GUARANTEE.label;
}

/** `Oylik yoki foiz — kattasi · 3 000 000 so'm · 50%` (§A.10, §C.5, §E.5). */
export function ruleSummary(rule: Pick<RuleView, 'baseSalary' | 'revenuePercent' | 'perLessonRate' | 'combineMode'>): string {
  const scheme = schemeOfRule(rule);
  const parts = [SCHEME_META[scheme].label];
  if (SCHEME_FIELDS[scheme].base && rule.baseSalary > 0) parts.push(`${formatNumber(rule.baseSalary)} so'm`);
  if (SCHEME_FIELDS[scheme].percent && rule.revenuePercent > 0) parts.push(`${rule.revenuePercent}%`);
  if (SCHEME_FIELDS[scheme].perLesson && rule.perLessonRate > 0) parts.push(`${formatNumber(rule.perLessonRate)} so'm`);
  return parts.join(' · ');
}

/**
 * `Iyul uchun keyin tushgan to'lov` — `sourcePeriod` dan yasaladi [§H.3/8].
 *
 * "kech kelgan" emas, "keyin tushgan" [§F.1]: birinchisi kimningdir aybini
 * bildiradi, ikkinchisi shunchaki faktni.
 */
export function adjustmentLabel(a: { label: string; sourcePeriod: string | null; amount: number }): string {
  if (!a.sourcePeriod) return a.label;
  // A NEGATIVE row is not income. Calling a minus "keyin tushgan to'lov"
  // (money that came in later) put the word for an arrival next to a
  // subtraction — the teacher stops trusting the screen, which is exactly what
  // the itemised row exists to prevent [Sevara, yakuniy tekshiruv].
  if (a.amount < 0) return `${monthName(a.sourcePeriod)} uchun qaytarilgan to'lov`;
  return `${monthName(a.sourcePeriod)} uchun keyin tushgan to'lov`;
}

/**
 * The sentence a negative row MUST carry. The last clause is the important
 * one: without it the teacher goes looking for what else was taken away.
 */
export const REFUND_HINT =
  "To'lov o'quvchiga qaytarilgani uchun undan hisoblangan ulush ham qaytdi. Boshqa hech narsa olib qo'yilmadi.";
