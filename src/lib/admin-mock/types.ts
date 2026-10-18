/**
 * admin-mock API shapes — .claude/specs/mock-admin/_api-contract.md v0.1. Existing ERP owner-mock
 * types (B2C §12) are reused, not copied.
 */
import type {
  MockAdminAction, MockMoney, MockOrderStatus, MockPaymentEvent, MockPromo, MockPromoInput, MockTicket, OwnerLearner, OwnerOrder,
} from '@/lib/types/owner-mock';

export type Money = MockMoney;
export type AdminExam = 'ielts' | 'sat' | 'cefr';
export type ExamSlug = 'ielts' | 'sat' | 'cefr' | 'toefl' | 'hsk';
export type MockRole = 'owner' | 'operator' | 'content';
export type Perm = 'mock.manage' | 'mock.content' | 'mock.pricing' | 'mock.insights' | 'mock.settings';
export interface Page<T> { items: T[]; total: number; page: number; pageSize: number }

/* ---------- auth §1 ---------- */
export interface AdminMe {
  user: { id: string; fullName: string; email: string; initials: string };
  mockRole: MockRole; roleLabel: 'Owner' | 'Operator' | 'Kontent'; permissions: string[]; twoFactorEnabled: true; env: 'PROD' | 'DEV';
}
export interface LoginRes { step: 'totp' | 'enroll'; challengeToken: string; challengeExpiresAt: string }
export interface EnrollRes { secret: string; otpauthUrl: string; qrSvg: string }
export interface VerifyRes { accessToken: string; expiresAt: string; me: AdminMe }
export interface InviteInfo { email: string; fullName: string | null; role: MockRole; expiresAt: string }

/* ---------- shell §2 ---------- */
export interface Badges { pendingManualOrders: number; openTickets: number; unreadNotifications: number }
export type AttemptStatus = 'in_progress' | 'grading' | 'completed' | 'expired' | 'ai_failed' | 'cancelled';
export interface SearchRes {
  learners: Array<{ id: string; shortId: string; email: string | null; displayName: string | null; status: string }>;
  orders: Array<{ id: string; reference: string; receiptNo: string | null; status: MockOrderStatus; total: Money; learnerEmail: string | null }>;
  attempts: Array<{ id: string; shortId: string; exam: string; testTitle: string; learnerEmail: string | null; status: AttemptStatus }>;
  tickets: Array<{ id: string; no: number; subject: string; email: string; status: 'OPEN' | 'CLOSED' }>;
}
export interface NotificationItem {
  id: string; at: string; unread: boolean; kind: string; tone: 'warn' | 'ok' | 'blue' | 'err';
  order?: { id: string; reference: string; total: Money; provider: 'manual' | 'paddle'; learnerEmail: string | null };
  ticket?: { id: string; no: number; subject: string; email: string };
  href: { type: 'order' | 'ticket' | 'audit'; id: string };
}
export interface NotificationsRes { items: NotificationItem[]; unreadCount: number }

/* ---------- dashboard §3 ---------- */
export interface Conv { cohort: number; converted: number; rate: number }
export type ByExam<T> = Record<AdminExam, T>;
export interface DashboardRes {
  period: { key: string; from: string; to: string; prevFrom: string; prevTo: string; tz: string };
  kpis: {
    revenue: { current: Money[]; previous: Money[]; currentUzsEq: number; previousUzsEq: number };
    paidOrders: { current: number; previous: number };
    newLearners: { current: number; previous: number };
    fullMocksStarted: { current: number; previous: number; byExam: ByExam<number> };
    freeToPaid: { current: Conv; previous: Conv };
  };
  revenueDaily: { from: string; to: string; days: Array<{ date: string; byExam: ByExam<{ uzsEq: number; money: Money[] }> }> };
  funnel: { from: string; to: string; steps: Array<{ key: 'signed_up' | 'email_verified' | 'free_section' | 'first_payment' | 'repeat_payment'; n: number }> };
  topProducts: Array<{ sku: string; exam: string; kind: string; qty: number; paidOrders: number }>;
  aiQueue: { state: 'running' | 'idle' | 'paused_budget' | 'stalled'; running: number; queued: number; avgSec24h: number | null; failed24h: number; oldestQueuedSec: number | null };
  openTickets: { count: number; latest: Array<{ id: string; no: number; subject: string; email: string; createdAt: string }> };
  fx: { USD: number; EUR: number; source: 'env' };
  serverNow?: string;
}

/* ---------- orders §4 ---------- */
export type OrderTab = 'pending_manual' | 'all' | 'paid' | 'failed' | 'refunded';
export type MethodGroup = 'card' | 'wallet' | 'local';
export type AdminOrderRow = OwnerOrder & {
  learner: { id: string; email: string | null; displayName: string | null; country: string | null };
  hasTransferClaim: boolean; lastClaimAt: string | null;
};
export interface OrdersRes extends Page<AdminOrderRow> {
  counts: { pendingManual: number; all: number; paid: number; failed: number; refunded: number };
  serverNow?: string;
}
export interface CreditSnap { fullMocks: number; sections: number; unlimitedUntil: string | null }
export interface AdminExamCredits {
  exam: AdminExam; siteStatus: 'open' | 'coming_soon';
  fullMocks: number; sections: number; unlimitedUntil: string | null;
  freeSection: { used: boolean; usedAt: string | null; sectionKey: string | null; available: boolean };
  freshTests: number; canStartFull: boolean; blockedReason: 'NO_CREDIT' | 'NO_FRESH_TEST' | 'COMING_SOON' | null;
  nextExpiry: { fullMocks: number; sections: number; at: string } | null;
}
export interface TransferClaim { id: string; note: string | null; createdAt: string; file: { mime: string; bytes: number; url: string } | null }
export interface TimelineItem {
  at: string;
  kind: 'created' | 'transfer_claimed' | 'marked_paid' | 'marked_failed' | 'refunded' | 'expired' | 'cancelled_by_learner' | 'paddle_paid' | 'paddle_failed' | 'paddle_refunded' | 'amount_mismatch';
  actor: { type: 'learner' | 'admin' | 'system' | 'provider'; name: string | null };
  meta: Record<string, unknown>;
}
export interface OrderDetailRes {
  order: OwnerOrder & {
    decidedBy: { id: string; fullName: string } | null;
    payInstructions: { channels: Array<{ type: 'card_transfer' | 'click_invoice' | 'telegram'; valueMasked: string; holder: string | null }> } | null;
    receivedAmount: Money | null;
  };
  learner: OwnerLearner | null;
  learnerCard: {
    id: string; shortId: string; email: string | null; displayName: string | null; country: string | null; locale: string; status: string;
    goal: { exam: string; target: number | null; examDate: string | null } | null;
    credits: AdminExamCredits[]; paidTotal: Money[];
  } | null;
  grants: { fullMocks: number; sections: number; unlimitedDays: number; validityMonths: number | null; exam: string };
  lots: Array<{ id: string; exam: string; kind: string; qty: number; remaining: number; expiresAt: string }>;
  claims: TransferClaim[];
  paddle: { transactionId: string | null; events: Array<{ at: string; eventType: string; outcome: string | null; httpStatus: number }> } | null;
  timeline: TimelineItem[];
  refundPreview: { granted: number; used: number; willRevoke: number; unlimitedActive: boolean } | null;
  can: { markPaid: boolean; markFailed: boolean; refund: boolean };
  events: MockPaymentEvent[]; actions: MockAdminAction[];
  serverNow?: string;
}
export interface MarkPaidRes {
  order: OwnerOrder; credits: { exam: AdminExam; before: CreditSnap; after: CreditSnap };
  lots: Array<{ id: string; kind: string; qty: number; expiresAt: string }>; receiptMailQueued: boolean;
}

/* ---------- learners §5 ---------- */
export type AdminLearnerRow = OwnerLearner & {
  shortId: string; attempts: number; paidTotal: Money[];
  balances: Array<{ exam: AdminExam; fullMocks: number; sections: number; unlimitedUntil: string | null }>;
  lastActiveAt: string | null;
};
export interface LotRow {
  id: string | null; source: 'order' | 'admin' | 'promo' | 'free';
  ref: { type: 'order'; id: string; reference: string | null } | { type: 'admin_action'; id: string } | null;
  exam: AdminExam; kind: 'full' | 'section' | 'unlimited'; sectionKey: string | null;
  qty: number; remaining: number; expiresAt: string | null; expired: boolean;
}
export interface LearnerDetailRes {
  learner: OwnerLearner;
  header: { shortId: string; lastActiveAt: string | null; createdAt: string; emailVerified: boolean; country: string | null; locale: string; goal: OwnerLearner['goal'] };
  adminCredits: AdminExamCredits[];
  lotRows: LotRow[];
  counts: { ledger: number; orders: number; attempts: number; tickets: number };
  liveSessions: number;
}
export interface LedgerRow {
  id: string; at: string; delta: number; exam: string; kind: string;
  reason: 'GRANT_ORDER' | 'ADMIN_ADJUST' | 'ADMIN_REVOKE' | 'CONSUME_ATTEMPT' | 'REFUND_AUTO' | 'REFUND_REVOKE' | 'FREE_SECTION';
  note: string | null; ref: { type: 'order' | 'attempt' | 'admin_action'; id: string; label: string } | null;
}

/* ---------- attempts §6 ---------- */
export interface AdminAttemptRow {
  id: string; shortId: string; exam: string; testId: string; testTitle: string | null; testCode: string | null;
  type: 'full' | 'section' | 'free_section'; sectionKey: string | null; status: AttemptStatus;
  score: { value: number; label: string | null } | null;
  startedAt: string; finishedAt: string | null; durationSec: number | null;
  learner: { id: string; email: string | null; displayName: string | null };
  charge: { source: 'free' | 'unlimited' | 'order' | 'admin' | 'promo' | null; orderId: string | null; orderReference: string | null; refunded: boolean };
}
export interface AttemptDetailRes {
  attempt: AdminAttemptRow;
  sections: Array<{ key: string; label: string; status: 'READY' | 'GRADING' | 'NOT_GRADED' | 'NOT_TAKEN'; score: number | null }>;
  aiTasks: Array<{
    taskKey: string; label: string; kind: string; status: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED' | 'NEEDS_HUMAN';
    score: number | null; tries: number; durationSec: number | null;
    errorCode: 'TIMEOUT' | 'QUOTA' | 'AUTH' | 'PROVIDER' | 'NO_AUDIO' | 'REFUSAL' | 'OTHER' | null; regradable: boolean;
  }>;
  refund: { allowed: boolean; what: 'full' | 'section' | 'free' | null; reason: 'ALREADY_REFUNDED' | 'UNLIMITED' | null };
}

/* ---------- prices §7 ---------- */
export interface ProductItem {
  sku: string; exam: AdminExam; kind: 'section' | 'full' | 'bundle' | 'unlimited'; qty: number;
  grants: { fullMocks: number; sections: number; unlimitedDays: number }; validityMonths: number | null;
  prices: { UZS: number | null; USD: number | null; EUR: number | null };
  isActive: boolean; available: boolean; unavailableReason: 'INACTIVE' | 'COMING_SOON' | 'NOT_ENOUGH_TESTS' | null;
  paddle: { priceId: string | null; source: 'db' | 'env' | 'legacy' | null; env: 'sandbox' | 'live'; pendingArchive: string[] };
  sortOrder: number;
}
export interface ProductsRes { items: ProductItem[]; paddleState: 'live' | 'sandbox' | 'not_configured' }
export interface PriceChangeRes {
  product: ProductItem;
  /** null on an idempotent replay */
  paddle: { synced: boolean; reason: 'NOT_CONFIGURED' | 'NO_PADDLE_PRICE' | 'NOT_SOLD_VIA_PADDLE' | 'UZS_ONLY' | 'UNCHANGED' | null; newPriceId: string | null; archivePendingPriceId: string | null } | null;
}

/* ---------- promo §8 ---------- */
export type AdminPromo = MockPromo & { state: 'active' | 'scheduled' | 'ended' | 'exhausted' | 'disabled'; exams: string[]; paddle: { discountId: string | null; synced: boolean } };
export type AdminPromoInput = MockPromoInput & { exams?: AdminExam[] };

/* ---------- tests §9 ---------- */
export interface TestFamily {
  family: ExamSlug; label: string; siteStatus: 'open' | 'coming_soon'; b2cReady: boolean;
  published: number; drafts: number; archived: number; noFreshLearners: number; noFreshWithCredits: number;
}
export interface TestItem {
  id: string; title: string; code: string; examCode: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; configVersion: string;
  sections: string[]; questionCount: number; errorCount: number; warnCount: number; attemptsB2c: number;
  avgScore: { value: number; n: number } | null; createdAt: string; publishedAt: string | null;
}
export interface ImportStage {
  stageId: string; expiresAt: string;
  files: { test: { name: string; bytes: number }; media: { name: string; bytes: number; entries: number } | null };
  ok: boolean; report: Array<{ level: 'ok' | 'warn' | 'error'; path: string; message: string }>;
  counts: { stages: number; questions: number };
  sectionCounts: Array<{ section: string; questions: number; tasks: number; parts: number }>;
}

/* ---------- stats §10 ---------- */
export interface InsightsRes {
  weeklyRevenue: { weeks: Array<{ isoWeek: number; from: string; to: string; byExam: ByExam<number> }> };
  splits30d: {
    currency: Array<{ currency: 'UZS' | 'USD' | 'EUR'; share: number; uzsEq: number; orders: number }>;
    method: Array<{ methodGroup: MethodGroup; share: number; uzsEq: number; orders: number }>;
  };
  cohorts: { months: Array<{ month: string; size: number; retention: Array<number | null> }> };
  scoreDistribution: { exam: 'ielts' | 'sat'; n: number; median: number | null; bins: Array<{ from: number; to: number; label: string; n: number }> };
  aiCost: { days: Array<{ date: string; usd: number }>; budgetUsdPerDay: number | null; overBudgetDays: number };
  fx: { USD: number; EUR: number; source: 'env' };
}

/* ---------- tickets §11 ---------- */
export type AdminTicketRow = MockTicket & {
  no: number; subject: string; preview: string; learnerName: string | null; lastMessageAt: string; messagesCount: number; lastAuthor: 'LEARNER' | 'ADMIN' | 'SYSTEM';
};
export interface TicketsRes extends Page<AdminTicketRow> { counts: { open: number; closed: number } }
export interface TicketMessage { id: string | null; author: 'LEARNER' | 'ADMIN' | 'SYSTEM'; authorName: string | null; body: string; createdAt: string; mailStatus: 'QUEUED' | 'SENT' | 'FAILED' | null }
export interface TicketDetailRes {
  ticket: AdminTicketRow; messages: TicketMessage[];
  context: {
    learner: { id: string; email: string | null; displayName: string | null; status: string } | null;
    balances: Array<{ exam: string; fullMocks: number; sections: number; unlimitedUntil: string | null }>;
    lastOrders: Array<{ id: string; reference: string; status: MockOrderStatus; product: { exam: string; kind: string; qty: number }; total: Money }>;
    lastAttempt: { id: string; shortId: string; testTitle: string; score: { value: number; label: string | null } | null } | null;
  };
}

/* ---------- settings §12 ---------- */
export interface SettingsRes {
  examSettings: { freeSectionEnabled: boolean; unlimitedEnabled: boolean };
  manualTransfer: { cardNumber: string | null; cardHolder: string | null; telegram: string | null; clickUrl: string | null; configured: boolean };
  examSiteStatus: Record<ExamSlug, { status: 'open' | 'coming_soon'; b2cReady: boolean }>;
  paddle: { state: 'live' | 'sandbox' | 'not_configured'; env: 'sandbox' | 'live'; apiKey: boolean; webhookSecret: boolean; clientToken: boolean };
  comingSoonMethods: string[];
  sources: Record<string, 'db' | 'env'>;
}
export interface AdminMember {
  id: string; fullName: string | null; email: string; role: MockRole; isPlatformOwner: boolean;
  status: 'active' | 'invited' | 'disabled'; invitedAt: string | null; invitedBy: string | null;
  twoFactorEnabled: boolean; lastLoginAt: string | null;
}

/* ---------- audit §13 ---------- */
export type AuditItem = MockAdminAction & {
  admin: { id: string; fullName: string | null };
  actionKey: string; entityLabel: string | null;
  link: { type: 'order' | 'learner' | 'product' | 'test' | 'attempt' | 'ticket' | 'admin' | null; id: string | null };
  note: string | null; ip?: string | null;
};
export type AuditGroup = 'payments' | 'credits' | 'learners' | 'catalog' | 'content' | 'tickets' | 'settings' | 'auth' | 'alerts';
