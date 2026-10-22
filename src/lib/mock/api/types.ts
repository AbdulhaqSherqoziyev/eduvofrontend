/**
 * mock.eduvo.uz B2C API types — .claude/specs/mock-site/_api-contract.md v0.5 (Bekzod).
 * Keep in sync with the contract's Changelog; names follow the contract 1:1.
 */

export type Currency = 'UZS' | 'USD' | 'EUR';
export type Locale = string;
export type Theme = 'light' | 'dark' | 'system';
export type ExamSlug = 'ielts' | 'sat' | 'cefr' | 'toefl' | 'hsk';
export type OpenExamSlug = 'ielts' | 'sat';
export type AttemptMode = 'full' | 'section';
export type SectionKey = 'listening' | 'reading' | 'writing' | 'speaking' | 'reading_writing' | 'math';

export interface Money { currency: Currency; amountMinor: number }
export interface PriceSet { UZS: number; USD: number; EUR: number }

export type FieldErrorCode = 'REQUIRED' | 'EMAIL_INVALID' | 'PASSWORD_TOO_SHORT' | 'PASSWORD_TOO_WEAK' | 'PASSWORDS_DIFFER'
  | 'TOO_LONG' | 'OUT_OF_RANGE' | 'NOT_ALLOWED_VALUE' | 'DATE_IN_PAST' | 'BAD_FORMAT';

export interface Learner {
  id: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  hasPassword: boolean;
  authProviders: Array<'password' | 'google'>;
  locale: Locale;
  feedbackLang: Locale | null;
  theme: Theme;
  country: string | null;
  timezone: string | null;
  goal: { exam: OpenExamSlug; targetScore: number; examDate: string | null; noDateYet: boolean } | null;
  onboardingCompletedAt: string | null;
  notifications: { resultReady: boolean; writingGraded: boolean; weeklyTips: boolean };
  status: 'ACTIVE' | 'DELETION_PENDING';
  deletionScheduledAt: string | null;
  createdAt: string;
}

/* ---- §1 auth ---- */
export interface AuthSession { accessToken: string; accessExpiresAt: string; learner: Learner }

/* ---- §2 me ---- */
export type MePatch = Partial<{
  displayName: string;
  locale: Locale; feedbackLang: Locale | null; theme: Theme;
  country: string | null;
  timezone: string;
  goal: { exam: OpenExamSlug; targetScore: number; examDate: string | null; noDateYet?: boolean } | null;
  notifications: Partial<Learner['notifications']>;
  marketingOptIn: boolean;
  completeOnboarding: true;
}>;

/* ---- §3 catalog ---- */
export interface CatalogSection {
  key: SectionKey; durationMin: number; extraMin: number; questions: number | null; parts: number | null; tasks: number | null;
  modules: number | null; aiGraded: boolean; freeEligible: boolean;
}
export interface CatalogExam {
  slug: ExamSlug; examCode: string | null; name: string;
  status: 'open' | 'coming_soon';
  facts: { totalDurationMin: number; questions: number; tasks: number; modules: number | null; scale: { min: number; max: number; step: number } } | null;
  sections: CatalogSection[];
  breakMin: number | null;
  fullMockPrice: PriceSet | null;
  /** v0.5: tests this learner (guest: the bank) has not seen yet */
  freshTests?: number | null;
}
export type ProductKind = 'section' | 'full' | 'bundle' | 'unlimited';
export interface Product {
  sku: string;
  exam: OpenExamSlug;
  kind: ProductKind;
  qty: number;
  grants: { fullMocks: number; sections: number; unlimitedDays: number };
  price: PriceSet;
  perMock: PriceSet | null;
  savingPct: number | null;
  validityMonths: number | null;
  badge: 'most_chosen' | null;
  available: boolean;
  /** v0.5: why `available:false` — NOT_ENOUGH_TESTS = more credits than unseen tests */
  unavailableReason?: 'INACTIVE' | 'COMING_SOON' | 'NOT_ENOUGH_TESTS' | null;
}
export interface Catalog {
  exams: CatalogExam[];
  products: Product[];
  suggestedCurrency: Currency;
  currencies: Currency[];
  creditValidityMonths: number;
  taxesIncluded: true;
  serverNow: string;
}

/* ---- §4 credits ---- */
export interface ExamCredits {
  exam: OpenExamSlug;
  fullMocks: number;
  sections: number;
  freeSectionUsed: boolean;
  freeSectionAvailable: boolean;
  unlimitedUntil: string | null;
  nextExpiry: { fullMocks: number; sections: number; at: string } | null;
  /** v0.5 */
  freshTests?: number;
  unusableCredits?: number;
  blockedReason?: 'NO_FRESH_TEST' | null;
}

/* ---- §5 dashboard ---- */
export type NextStep =
  | { kind: 'resume'; attemptId: string; exam: OpenExamSlug; mode: AttemptMode; testCode: string; sectionKey: SectionKey; remainingSec: number | null; doneSections: Array<{ key: SectionKey; score: number | null }>;
      /** speaking contract v1.2/v1.4: the attempt is open until this time (Speaking: L/R/W finish + 7 days) */
      availableUntil?: string | null;
      /** v1.4: L/R/W done, only the separate-sitting Speaking is left */
      speakingLater?: boolean }
  | { kind: 'verify_email' }
  | { kind: 'free_section'; exams: OpenExamSlug[] }
  | { kind: 'writing_grading'; attemptId: string; exam: OpenExamSlug }
  | { kind: 'take_mock'; exam: OpenExamSlug; hasCredit: boolean; noFreshTest?: boolean }
  | { kind: 'review_result'; attemptId: string; exam: OpenExamSlug };

export type SeriesKey = 'overall' | SectionKey;
export interface ProgressSeries {
  exam: OpenExamSlug;
  target: number | null;
  scale: { min: number; max: number; step: number };
  series: Partial<Record<SeriesKey, Array<{ attemptId: string; at: string; value: number }>>>;
}
export interface WeakType { type: string; correct: number; total: number; pct: number }
export interface AttemptListItem {
  attemptId: string; exam: OpenExamSlug; testCode: string; mode: AttemptMode; sectionKey: SectionKey | null;
  status: 'in_progress' | 'grading' | 'completed' | 'expired' | 'cancelled';
  startedAt: string; finishedAt: string | null;
  /** v0.5: Writing could not be graded (score null, credit refunded) */
  notGraded?: boolean;
  refunded?: boolean;
  /** v0.5 §18.9: objective answers (null while in progress/grading, cancelled, not graded, old snapshots) */
  correct?: number | null;
  total?: number | null;
  correctBySection?: Array<{ key: SectionKey; correct: number; total: number }> | null;
  remainingSec: number | null;
  score: { value: number | null; label: string | null } | null;
  isFree: boolean;
}
export interface ProductTitle { sku: string; kind: ProductKind; exam: OpenExamSlug; qty: number }
export interface Dashboard {
  learner: Pick<Learner, 'displayName' | 'goal' | 'emailVerified' | 'onboardingCompletedAt'>;
  isEmpty: boolean;
  stats: { mocksTaken: number; lastMockAt: string | null };
  nextStep: NextStep;
  target: { exam: OpenExamSlug; current: number | null; target: number; gap: number | null; belowTargetSections: SectionKey[] } | null;
  countdown: { exam: OpenExamSlug; examDate: string; days: number } | null;
  progress: ProgressSeries | null;
  weakestTypes: WeakType[];
  weakestBasis: { exam: OpenExamSlug; attempts: number } | null;
  mocks: AttemptListItem[];
  credits: ExamCredits[];
  recentPurchases: Array<{ orderId: string; title: ProductTitle; paidAt: string; status?: OrderStatus }>;
  serverNow: string;
}
export interface Recommendation { code: string; params: Record<string, string | number> }

/* ---- §6 start ---- */
export type StartBlockReason = 'EMAIL_NOT_VERIFIED' | 'NO_CREDIT' | 'NO_FRESH_TEST' | 'ACTIVE_ATTEMPT_EXISTS' | 'COMING_SOON' | 'SECTION_NOT_AVAILABLE' | 'DESKTOP_REQUIRED';
export type Charge =
  | { source: 'free' }
  | { source: 'unlimited'; until: string }
  | { source: 'section_credit'; remainingAfter: number }
  | { source: 'full_credit'; remainingAfter: number };
export type SystemCheckKey = 'audio' | 'headphones' | 'fullscreen' | 'internet' | 'microphone';
export interface StartInfo {
  exam: OpenExamSlug; examCode: string;
  test: { id: string; code: string; isNew: true } | null;
  mode: AttemptMode; sectionKey: SectionKey | null;
  sections: Array<{ key: SectionKey; durationMin: number; extraMin: number; questions: number | null; parts: number | null; tasks: number | null; aiGraded: boolean; tag: 'included' | 'free' | 'credit' | 'unavailable' }>;
  totalDurationMin: number;
  charge: Charge | null;
  blocked: null | { reason: StartBlockReason; attemptId?: string };
  systemCheck: SystemCheckKey[];
  startUrl: string;
  serverNow: string;
  freshTests?: number;
}
export interface CreatedAttempt {
  attemptId: string; examCode: string; testId: string; testCode: string;
  charge: Charge;
  stages: unknown[];
  playerUrl: string;
  serverNow: string;
}

/* ---- §8 results (only the `mock` extension is typed here; the EXAM §1.10 body is the player's ExamResult) ---- */
export interface ResultCriterion { code: 'TA' | 'TR' | 'CC' | 'LR' | 'GRA'; score: number; max: number; feedback: string }
export type WaitlistTopic = 'cefr' | 'toefl' | 'hsk' | 'unlimited_ielts' | 'unlimited_sat';
export interface ResultWriting {
  taskKey: 'task1' | 'task2'; status: 'GRADING' | 'READY' | 'NOT_GRADED';
  prompt: string; essay: string; words: number; band: number | null;
  criteria: ResultCriterion[] | null; strengths: string[]; nextSteps: string[]; feedbackLang: Locale;
}
export interface MockResultExt {
  exam: OpenExamSlug; testCode: string; mode: AttemptMode; sectionKey: SectionKey | null;
  finishedAt: string | null;
  cefr: string | null;
  target: { value: number; gap: number | null } | null;
  sectionCards: Array<{ key: SectionKey; score: number | null; label: string | null; correct: number | null; total: number | null; aiGraded: boolean; status: 'READY' | 'GRADING' | 'NOT_GRADED' | 'NOT_TAKEN' }>;
  /** v0.5: Writing could not be graded — no overall, credit refunded */
  notGraded: { sections: SectionKey[]; refunded: boolean; reason: string } | null;
  accuracyByType: Array<{ section: SectionKey; type: string; correct: number; total: number; pct: number }>;
  strongest: string[]; weakest: string[];
  nextSteps: Recommendation[];
  writing: ResultWriting[];
  reviewExtra: Record<string, { prompt: string; typeLabelKey: string; evidence: { paragraph: string; text: string | null } | null }>;
  share: { token: string; url: string } | null;
  pdfAvailable: boolean;
}
export interface ShareCard {
  exam: OpenExamSlug; scoreLabel: string; scaleMax: number; cefr: string | null;
  mode: AttemptMode; sectionKey: SectionKey | null; takenAt: string; firstName: string | null;
  /** v0.5: full mock section scores */
  sections?: Array<{ key: SectionKey; label: string | null }>;
}

/* ---- §9 checkout ---- */
export type ProviderCode = 'manual' | 'paddle';
export type PaymentMethodGroup = 'card' | 'wallet' | 'local';
export type MethodReason = 'NOT_CONFIGURED' | 'CURRENCY_NOT_SUPPORTED' | null;
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export interface Quote {
  sku: string; product: Product; currency: Currency;
  subtotal: Money; discount: Money; total: Money; taxesIncluded: true;
  promo: { code: string; percentOff: number } | null;
}
/** v0.2 §16.12: `card_transfer.value` is the full card number (no spaces), `holder` its owner. */
export interface ManualInstructions {
  reference: string;
  amount: Money;
  channels: Array<{ type: 'telegram' | 'card_transfer' | 'click_invoice'; value: string; holder: string | null }>;
  expectedWithinMin: number;
}
export type OrderNextAction =
  | { kind: 'redirect'; url: string }
  | { kind: 'paddle_overlay'; clientToken: string; transactionId: string }
  | { kind: 'manual'; instructions: ManualInstructions };
export interface Order {
  id: string; status: OrderStatus;
  /** v0.3: always present ('EM-P-7Q4K2'), also on PAID */
  reference: string;
  quote: Quote;
  provider: ProviderCode; methodGroup: PaymentMethodGroup;
  failureCode: 'DECLINED' | 'EXPIRED' | 'AMOUNT_MISMATCH' | 'PROVIDER_ERROR' | null;
  receiptNo: string | null;
  granted: { fullMocks: number; sections: number; unlimitedDays: number } | null;
  next: OrderNextAction | null;
  createdAt: string; paidAt: string | null; expiresAt: string;
}
export interface CheckoutMethods {
  /** v0.3: card/wallet = paddle (USD/EUR only), local = manual (UZS only); `reason` explains `enabled:false` */
  methods: Array<{ group: PaymentMethodGroup; provider: ProviderCode; enabled: boolean; reason: MethodReason; providers?: Array<{ code: string; name: string }> }>;
  serverNow: string;
}
