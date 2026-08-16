/**
 * Ish haqi — kompensatsiya qoidasi, jonli misol, ustoz kartasi va davr hisobi.
 *
 * Backendning javob shakllari bilan bir xil (spec §H.2). Ataylab YO'Q maydonlar:
 * `projected` / `estimated` / `expectedTotal` (prognoz taqiqlangan [SV6]),
 * `pending.byGroup` [SV1] va qator ichidagi `partial` [SV2] — bu maydonlar tipda
 * bo'lsa, ular ertami-kechmi ekranga chiziladi.
 */

export type SubjectType = 'TEACHER' | 'USER';
export type CombineMode = 'GUARANTEE' | 'SUM';
export type PayScheme = CombineMode | 'PER_LESSON';
export type PeriodStatus = 'DRAFT' | 'APPROVED' | 'PAID';

/**
 * Formadagi besh nomlangan rejim (§A.3). Backendda uchta sxema bor
 * (`GUARANTEE` / `SUM` / `PER_LESSON`); `BASE_ONLY` va `PERCENT_ONLY` — o'sha
 * sxemalarning nol qiymatli holatlari, lekin direktor ularni alohida shart deb
 * o'ylaydi ("50/50 ishlaymiz") va ro'yxatda alohida turishi kerak [§J.2/7].
 */
export type UiScheme = 'BASE_ONLY' | 'GUARANTEE' | 'SUM' | 'PERCENT_ONLY' | 'PER_LESSON';

export interface RuleView {
  id: string;
  combineMode: CombineMode;
  baseSalary: number;
  revenuePercent: number;
  revenueBase: string;
  perLessonRate: number;
  perStudentBonus: number;
  bonusPercent: number;
  bonusTrigger: string;
  effectiveFrom: string;
  effectiveFromPeriod: string;
  createdAt: string;
  createdById: string | null;
}

export interface CompensationView {
  subjectType: SubjectType;
  subjectId: string;
  subjectName: string;
  /** Login bo'lmasa `null` — bonus bloki faqat shu bo'lganda ko'rinadi (§A.5). */
  subjectUserId: string | null;
  /** Eng yangi versiya — forma shuni tahrirlaydi. */
  rule: RuleView | null;
  /** SHU oyni to'layotgan versiya. `rule` dan farq qilishi normal [SV3]. */
  activeRule: RuleView | null;
  currentPeriod: string;
  defaultEffectiveFrom: string;
  defaultEffectiveFromPeriod: string;
  currentPeriodStatus: PeriodStatus | null;
}

export interface CompensationInput {
  combineMode?: CombineMode;
  baseSalary?: number;
  revenuePercent?: number;
  revenueBase?: string;
  perLessonRate?: number;
  perStudentBonus?: number;
  bonusPercent?: number;
  bonusTrigger?: string;
  /** "YYYY-MM". Tashlab ketilsa backend keyingi oyni oladi [SV3]. */
  effectiveFrom?: string;
}

export interface Split {
  staff: number;
  center: number;
}

export interface PreviewInput {
  subjectType: SubjectType;
  subjectId: string;
  rule: CompensationInput;
  period?: string;
  assumedRevenue?: number;
}

export interface PreviewResponse {
  period: string;
  /** `ACTUAL` — haqiqatan pul tushgan oy; `ASSUMED` — taxminiy misol (§B.4). */
  source: 'ACTUAL' | 'ASSUMED';
  revenue: number;
  scheme: PayScheme;
  result: Split;
  byMode: Record<CombineMode, Split>;
  formula: { base: number; share: number; percent: number; lessons?: number };
}

export interface PayrollAdjustmentView {
  label: string;
  amount: number;
  note: string;
  /** "2026-07" — `Iyul uchun keyin tushgan to'lov` matni shundan yasaladi. */
  sourcePeriod: string | null;
}

export interface MyPayrollView {
  period: string;
  status: PeriodStatus;
  subjectName: string;
  rule: { mode: string; baseSalary: number; percent: number; perLessonRate: number } | null;
  /** Qoida shu davr ichida qayta saqlangan bo'lsa — sana [SV3]. */
  ruleChangedAt: string | null;
  base: number;
  share: number;
  bonus: number;
  /** `max(0, tan oylik − ulush)` — kafolat platosi jumlasi shundan [SV6]. */
  guaranteeGap: number;
  adjustments: PayrollAdjustmentView[];
  total: number;
  /** Bitta jami. Guruh kesimi umuman yo'q [SV1]. */
  pending: { total: number };
  prevPeriod: { label: string; approvedAt: string | null } | null;
  groups: Array<{ id: string; name: string; studentCount: number; collected: number }>;
  paidAt: string | null;
  notCovered: boolean;
}

/** Tushgan to'lov qatori. Qarz/qisman belgisi ataylab yo'q [SV2]. */
export interface MyPayrollLine {
  studentName: string;
  groupName: string;
  date: string;
  paidAmount: number;
  shareAmount?: number;
  proratedDays?: number;
}

export interface MyPayrollLines {
  items: MyPayrollLine[];
  total: number;
  count: number;
}

export interface PeriodLineView {
  id: string;
  subjectType: SubjectType;
  subjectId: string;
  subjectName: string;
  base: number;
  share: number;
  bonus: number;
  adjust: number;
  total: number;
  paid: boolean;
  paidAt: string | null;
}

export interface PeriodView {
  /**
   * Davr qatorining uuid'si — `POST /payroll/pay` shuni talab qiladi.
   *
   * HOZIRCHA JAVOBDA YO'Q (`payroll-period.service.ts#view` uni qaytarmaydi),
   * shuning uchun ixtiyoriy. U kelmaguncha `To'lovni yozish` tugmasi umuman
   * render qilinmaydi — ishlamaydigan tugma qo'yish spec §G.1 ning "yashirish
   * usuli — render qilmaslik" qoidasiga zid.
   */
  id?: string;
  period: string;
  status: PeriodStatus;
  computedAt: string | null;
  approvedAt: string | null;
  approvedBy: string;
  totals: { base: number; share: number; extra: number; total: number };
  lines: PeriodLineView[];
  missingRules: Array<{ subjectType: SubjectType; subjectId: string; name: string }>;
}

export interface AdjustLineInput {
  amount: number;
  reason: string;
  note?: string;
}

export interface PayPayrollInput {
  periodId: string;
  lineIds: string[];
  method: 'CASH' | 'CARD';
  date?: string;
  clientRef?: string;
}

export interface PayResult {
  paid: number;
  amount: number;
  period: PeriodView;
}
