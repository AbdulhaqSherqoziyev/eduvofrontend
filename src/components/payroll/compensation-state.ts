import { SCHEME_FIELDS, schemeOfRule } from '@/lib/utils/payroll-labels';
import type { CompensationInput, CompensationView, UiScheme } from '@/lib/types/payroll';

/**
 * "Ish haqi" formasining holati (§A).
 *
 * Raqamlar STRING bo'lib turadi (`AmountField` xom raqamlar bilan ishlaydi) va
 * rejim almashganda O'CHMAYDI: direktor rejimlarni solishtirib ko'radi, kiritgan
 * summasi har bosishda yo'qolsa u solishtirishni tashlab ketadi. Saqlashda esa
 * faqat JORIY rejim maydonlari yuboriladi — `perLessonRate` bilan
 * `revenuePercent` birga saqlansa ular qo'shiladi degan ma'no chiqadi [O1].
 */
export interface CompDraft {
  scheme: UiScheme;
  baseSalary: string;
  revenuePercent: string;
  perLessonRate: string;
  bonusOn: boolean;
  bonusKind: 'FIXED' | 'PERCENT';
  bonusAmount: string;
  bonusPercent: string;
  /** `Shu oydan boshlab qo'llash` — DEFAULT O'CHIQ [SV3]. */
  thisMonth: boolean;
}

const num = (v: string): number => Number(v || 0);

/** Bo'sh forma: default rejim — `Oylik yoki foiz — kattasi` [Q1]. */
export const EMPTY_DRAFT: CompDraft = {
  scheme: 'GUARANTEE',
  baseSalary: '',
  revenuePercent: '',
  perLessonRate: '',
  bonusOn: false,
  bonusKind: 'FIXED',
  bonusAmount: '',
  bonusPercent: '',
  thisMonth: false,
};

export function draftFromRule(view: CompensationView | undefined): CompDraft {
  const rule = view?.rule;
  if (!rule) return EMPTY_DRAFT;
  return {
    scheme: schemeOfRule(rule),
    baseSalary: rule.baseSalary ? String(rule.baseSalary) : '',
    revenuePercent: rule.revenuePercent ? String(rule.revenuePercent) : '',
    perLessonRate: rule.perLessonRate ? String(rule.perLessonRate) : '',
    bonusOn: rule.perStudentBonus > 0 || rule.bonusPercent > 0,
    bonusKind: rule.bonusPercent > 0 ? 'PERCENT' : 'FIXED',
    bonusAmount: rule.perStudentBonus ? String(rule.perStudentBonus) : '',
    bonusPercent: rule.bonusPercent ? String(rule.bonusPercent) : '',
    thisMonth: false,
  };
}

/** Faqat joriy rejim maydonlari — qolgani nol bo'lib ketadi. */
export function toRuleInput(draft: CompDraft, withBonus: boolean): CompensationInput {
  const fields = SCHEME_FIELDS[draft.scheme];
  const bonus = withBonus && draft.bonusOn;
  return {
    combineMode: draft.scheme === 'SUM' ? 'SUM' : 'GUARANTEE',
    baseSalary: fields.base ? num(draft.baseSalary) : 0,
    revenuePercent: fields.percent ? num(draft.revenuePercent) : 0,
    perLessonRate: fields.perLesson ? num(draft.perLessonRate) : 0,
    perStudentBonus: bonus && draft.bonusKind === 'FIXED' ? num(draft.bonusAmount) : 0,
    bonusPercent: bonus && draft.bonusKind === 'PERCENT' ? num(draft.bonusPercent) : 0,
    revenueBase: 'COLLECTED',
    bonusTrigger: 'FIRST_PAYMENT',
  };
}

/**
 * Saqlash payloadi. `effectiveFrom` faqat "shu oydan" yoqilganda yuboriladi —
 * yuborilmasa backendning o'zi keyingi oyni oladi, ya'ni default ikki joyda
 * takrorlanmaydi va ajralib keta olmaydi [SV3].
 */
export function toSaveInput(draft: CompDraft, view: CompensationView, withBonus: boolean): CompensationInput {
  const rule = toRuleInput(draft, withBonus);
  return draft.thisMonth ? { ...rule, effectiveFrom: view.currentPeriod } : rule;
}

export type CompErrors = Partial<Record<'baseSalary' | 'revenuePercent' | 'perLessonRate' | 'bonus', string>>;

/** Matnlar §A.7 jadvalidan aynan. */
export function validateDraft(draft: CompDraft, withBonus: boolean): CompErrors {
  const fields = SCHEME_FIELDS[draft.scheme];
  const errors: CompErrors = {};
  if (fields.base && !num(draft.baseSalary)) errors.baseSalary = 'Summani kiriting.';
  if (fields.perLesson && !num(draft.perLessonRate)) errors.perLessonRate = 'Summani kiriting.';
  if (fields.percent) {
    const percent = num(draft.revenuePercent);
    if (!draft.revenuePercent.trim()) errors.revenuePercent = 'Foizni kiriting.';
    else if (percent < 1 || percent > 100) errors.revenuePercent = 'Foiz 1 dan 100 gacha bo\'lishi kerak.';
  }
  if (withBonus && draft.bonusOn) {
    const value = draft.bonusKind === 'FIXED' ? num(draft.bonusAmount) : num(draft.bonusPercent);
    if (!value) errors.bonus = "Bonus summasini kiriting yoki bonusni o'chiring.";
  }
  return errors;
}

/**
 * Tasdiq dialogi faqat summa KAMAYGANDA yoki "shu oydan" yoqilganda (§A.7).
 *
 * Taqqoslash `rule ?? activeRule` bilan: qoida o'chirilgan bo'lsa `rule` bo'sh
 * bo'ladi, lekin xodim SHU oyda hali `activeRule` bo'yicha pul olayotgan
 * bo'ladi. Faqat `rule` ga qarash o'sha holatda 3 000 000 dan 1 000 000 ga
 * tushirishni "kamayish emas" deb o'qiydi va tasdiqsiz o'tkazib yuboradi.
 */
export function needsConfirm(draft: CompDraft, view: CompensationView | undefined): boolean {
  if (draft.thisMonth) return true;
  const rule = view?.rule ?? view?.activeRule;
  if (!rule) return false;
  return (
    num(draft.baseSalary) < rule.baseSalary ||
    num(draft.revenuePercent) < rule.revenuePercent ||
    num(draft.perLessonRate) < rule.perLessonRate
  );
}
