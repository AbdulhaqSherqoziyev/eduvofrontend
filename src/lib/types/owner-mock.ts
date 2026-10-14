/** Owner panel — mock.eduvo.uz (contract `_api-contract.md` §12, v0.5). */

export type MockCurrency = 'UZS' | 'USD' | 'EUR';
export interface MockMoney { currency: MockCurrency | string; amountMinor: number }
export type MockOrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type MockExam = 'ielts' | 'sat';
export type MockCreditKind = 'full' | 'section' | 'unlimited';
export type MockLearnerStatus = 'ACTIVE' | 'LOCKED' | 'DELETION_PENDING' | 'DELETED';

export interface KeysetPage<T> { items: T[]; nextCursor: string | null }

export interface MockProductView { sku: string; exam: MockExam; kind: 'section' | 'full' | 'bundle' | 'unlimited'; qty: number; grants?: { fullMocks: number; sections: number; unlimitedDays: number } }

export interface OwnerOrder {
  id: string;
  status: MockOrderStatus;
  reference: string;
  quote: { sku: string; product: MockProductView; currency: string; subtotal: MockMoney; discount: MockMoney; total: MockMoney; promo: { code: string; percentOff: number } | null };
  provider: 'manual' | 'paddle' | string;
  methodGroup: string;
  failureCode: string | null;
  receiptNo: string | null;
  granted: { fullMocks: number; sections: number; unlimitedDays: number } | null;
  createdAt: string; paidAt: string | null; expiresAt: string | null;
  learnerId: string; providerRef: string | null; note: string | null; decidedById: string | null; updatedAt: string;
}
export interface OwnerOrderListItem extends OwnerOrder { learner: { id: string; email: string | null; displayName: string | null } }

export interface OwnerLearner {
  id: string; email: string | null; emailVerified: boolean; displayName: string | null; locale: string; country: string | null; timezone: string | null;
  hasPassword: boolean; hasGoogle: boolean; status: MockLearnerStatus; deletionScheduledAt: string | null;
  goal: { exam: string; target: number | null; examDate: string | null } | null;
  marketingOptIn: boolean; createdAt: string; lastLoginAt: string | null;
}
export interface OwnerLearnerListItem extends OwnerLearner { attempts: number; paidTotal: MockMoney[] }

export interface MockExamCredits {
  exam: MockExam; fullMocks: number; sections: number; freeSectionUsed: boolean; freeSectionAvailable: boolean;
  unlimitedUntil: string | null; nextExpiry: { fullMocks: number; sections: number; at: string } | null;
  freshTests?: number; unusableCredits?: number; blockedReason?: 'NO_FRESH_TEST' | null;
}
export interface MockLot { id: string; exam: string; kind: string; qty: number; remaining: number; expiresAt: string; orderId: string | null; source: string; createdAt: string }
export interface MockLedgerTxn { id: string; exam: string; kind: string; delta: number; reason: string; orderId: string | null; attemptId: string | null; note: string | null; createdAt: string }
export interface MockAdminAction { id: string; platformUserId: string; action: string; entity: string; entityId: string | null; meta: Record<string, unknown> | null; createdAt: string }
export interface MockPaymentEvent { id: string; provider: string; eventId: string; eventType: string; outcome: string | null; createdAt: string }
export interface MockAttemptItem {
  attemptId: string; exam: MockExam; testCode: string; mode: 'full' | 'section'; sectionKey: string | null;
  status: 'in_progress' | 'grading' | 'completed' | 'expired' | 'cancelled';
  startedAt: string; finishedAt: string | null; score: { value: number | null; label: string | null } | null; isFree: boolean; notGraded?: boolean; refunded?: boolean;
  correct?: number | null; total?: number | null; correctBySection?: Array<{ key: string; correct: number; total: number }> | null;
}

export interface OwnerOrderDetail { order: OwnerOrder; learner: OwnerLearner | null; events: MockPaymentEvent[]; actions: MockAdminAction[]; lots: MockLot[] }
export interface OwnerLearnerDetail {
  learner: OwnerLearner; credits: MockExamCredits[]; lots: MockLot[]; ledger: MockLedgerTxn[]; attempts: MockAttemptItem[];
  orders: OwnerOrder[]; liveSessions: number; actions: MockAdminAction[];
}

export interface MockPromo {
  id: string; code: string; percentOff: number; skus: string[]; maxRedemptions: number | null; perLearnerLimit: number;
  validFrom: string | null; validTo: string | null; isActive: boolean; providerDiscountId: string | null; createdAt: string; redemptions: number;
}
export interface MockPromoInput {
  code?: string; percentOff: number; skus: string[]; maxRedemptions: number | null; perLearnerLimit: number;
  validFrom: string | null; validTo: string | null; isActive: boolean; providerDiscountId: string | null;
}

export interface MockTicket {
  id: string; learnerId: string | null; name: string; email: string; topic: string; message: string; testCode: string | null; orderId: string | null;
  locale: string; status: 'OPEN' | 'CLOSED'; createdAt: string; updatedAt: string;
}

export interface MockAttemptCounts { full: number; section: number; completed: number; cancelled: number; expired: number }
export interface MockStats {
  from: string; to: string;
  totals: {
    signups: number; verified: number; ordersCreated: number; paidOrders: number; revenue: MockMoney[];
    attemptsByExam: Partial<Record<string, MockAttemptCounts>>; attemptRefunds: Record<string, number>; aiSpendUsd: number;
  };
  daily: Array<{ date: string; signups: number; verified: number; ordersCreated: number; ordersPaid: number; revenue: MockMoney[] }>;
  bank: { publishedTests: Partial<Record<string, number>> };
  mail: { provider?: string; lastSendOk?: boolean | null; lastErrorAt?: string | null; queued?: number; failed24h?: number } | null;
  alerts24h: number;
}
