/** admin-mock endpoints (contract v0.1, §19 screen map). Paths are relative to /api/platform/mock. */
import type { MockAdminAction, MockCreditKind } from '@/lib/types/owner-mock';
import { req, reqBlob, type Query } from './http';
import type {
  AdminExam, AdminLearnerRow, AdminMe, AdminMember, AdminPromo, AdminPromoInput, AdminTicketRow, AttemptDetailRes, AdminAttemptRow,
  AuditItem, Badges, DashboardRes, EnrollRes, ImportStage, InsightsRes, InviteInfo, LearnerDetailRes, LedgerRow, LoginRes, MarkPaidRes,
  MockRole, NotificationsRes, OrderDetailRes, OrdersRes, Page, PriceChangeRes, ProductItem, ProductsRes, SearchRes, SettingsRes,
  TestFamily, TestItem, TicketDetailRes, TicketMessage, TicketsRes, VerifyRes, AdminExamCredits, ExamSlug, AdminOrderRow,
  AnExamsRes, AnGeoRes, AnHoursDayRes, AnHoursRes, AnLiveRes, AnOverviewRes, AnPagesRes, AnPaymentsRes, AnSourcesRes,
} from './types';

const post = <T>(path: string, body?: unknown, idem?: string, auth?: boolean) => req<T>(path, { method: 'POST', body: body ?? {}, idem, auth });
const patch = <T>(path: string, body: unknown, idem?: string) => req<T>(path, { method: 'PATCH', body, idem });

export const adminApi = {
  /* §1 auth */
  login: (email: string, password: string) => post<LoginRes>('/auth/login', { email, password }, undefined, true),
  enroll: (challengeToken: string) => post<EnrollRes>('/auth/2fa/setup', { challengeToken }, undefined, true),
  verify: (challengeToken: string, code: string) => post<VerifyRes>('/auth/2fa/verify', { challengeToken, code }, undefined, true),
  me: () => req<AdminMe>('/auth/me'),
  logout: () => post<{ ok: true }>('/auth/logout'),
  invite: (token: string) => req<InviteInfo>(`/auth/invite/${encodeURIComponent(token)}`, { auth: true }),
  acceptInvite: (body: { token: string; password: string; fullName?: string }) => post<{ ok: true; email: string }>('/auth/invite/accept', body, undefined, true),

  /* §2 shell */
  badges: () => req<Badges>('/badges'),
  search: (q: string, signal?: AbortSignal) => req<SearchRes>('/search', { query: { q }, signal }),
  notifications: () => req<NotificationsRes>('/notifications', { query: { limit: 20 } }),
  notificationsSeen: (upTo: string) => post<{ unreadCount: number }>('/notifications/seen', { upTo }),

  /* §3 */
  dashboard: (q: Query) => req<DashboardRes>('/dashboard', { query: q }),

  /* §4 orders */
  orders: (q: Query) => req<OrdersRes>('/orders', { query: q }),
  ordersCsv: (q: Query) => reqBlob('/orders/export.csv', { query: q }),
  order: (id: string) => req<OrderDetailRes>(`/orders/${encodeURIComponent(id)}`),
  claimFile: (url: string) => reqBlob(url.replace(/^.*\/api\/platform\/mock/, '')),
  markPaid: (id: string, body: { amountMinor: number; note?: string; providerRef?: string }) => post<MarkPaidRes>(`/orders/${id}/mark-paid`, body),
  markFailed: (id: string, body: { failureCode: 'DECLINED' | 'EXPIRED'; note: string; notifyLearner?: boolean }) =>
    post<{ order: AdminOrderRow; mailQueued: boolean }>(`/orders/${id}/mark-failed`, body),
  refund: (id: string, note: string) => post<{ revoked: number; alreadyUsed: number }>(`/orders/${id}/refund`, { note }),

  /* §5 learners */
  learners: (q: Query) => req<Page<AdminLearnerRow>>('/learners', { query: q }),
  learner: (id: string) => req<LearnerDetailRes>(`/learners/${encodeURIComponent(id)}`),
  learnerLedger: (id: string, q: Query) => req<Page<LedgerRow>>(`/learners/${id}/ledger`, { query: q }),
  learnerOrders: (id: string, q: Query) => req<Page<AdminOrderRow>>(`/learners/${id}/orders`, { query: q }),
  learnerAttempts: (id: string, q: Query) => req<Page<AdminAttemptRow>>(`/learners/${id}/attempts`, { query: q }),
  learnerTickets: (id: string, q: Query) => req<Page<AdminTicketRow>>(`/learners/${id}/tickets`, { query: q }),
  grant: (id: string, body: { exam: AdminExam; kind: MockCreditKind; qty: number; validityMonths?: number; unlimitedDays?: number; reason: string }, idem: string) =>
    post<{ replay: boolean; lot: { id: string; expiresAt: string } | null; actionId: string; adminCredits: AdminExamCredits }>(`/learners/${id}/grant`, body, idem),
  revoke: (id: string, body: { exam: AdminExam; kind: MockCreditKind; qty: number; reason: string }, idem: string) =>
    post<{ replay: boolean; revoked: number; adminCredits: AdminExamCredits }>(`/learners/${id}/revoke`, body, idem),
  lock: (id: string, reason: string) => post<{ status: 'LOCKED'; cancelledAttempts: number }>(`/learners/${id}/lock`, { reason }),
  unlock: (id: string) => post<{ status: string }>(`/learners/${id}/unlock`, {}),
  sendReset: (id: string, idem: string) => post<{ sent: true; kind: 'reset_password' | 'reset_google_only' }>(`/learners/${id}/send-password-reset`, {}, idem),

  /* §6 attempts */
  attempts: (q: Query) => req<Page<AdminAttemptRow>>('/attempts', { query: q }),
  attempt: (id: string) => req<AttemptDetailRes>(`/attempts/${encodeURIComponent(id)}`),
  regrade: (id: string, taskKey: string | undefined, idem: string) => post<{ queued: string[] }>(`/attempts/${id}/regrade`, taskKey ? { taskKey } : {}, idem),
  refundCredit: (id: string, reason: string, idem: string) =>
    post<{ refunded: 'full' | 'section' | 'free'; attempt: AdminAttemptRow; credits: AdminExamCredits }>(`/attempts/${id}/refund-credit`, { reason }, idem),

  /* §7 prices */
  products: (exam?: AdminExam) => req<ProductsRes>('/products', { query: { exam } }),
  setPrice: (sku: string, body: { currency: 'UZS' | 'USD' | 'EUR'; amountMinor: number; expectedAmountMinor: number | null }, idem: string) =>
    patch<PriceChangeRes>(`/products/${encodeURIComponent(sku)}/prices`, body, idem),
  setProductActive: (sku: string, isActive: boolean) => patch<{ product: ProductItem }>(`/products/${encodeURIComponent(sku)}`, { isActive }),

  /* §8 promo */
  promos: () => req<{ items: AdminPromo[] }>('/promo-codes'),
  createPromo: (body: AdminPromoInput) => post<{ promo: AdminPromo }>('/promo-codes', body),
  updatePromo: (id: string, body: Partial<AdminPromoInput>) => patch<{ promo: AdminPromo }>(`/promo-codes/${id}`, body),

  /* §9 tests */
  families: () => req<{ items: TestFamily[] }>('/tests/families'),
  tests: (family: ExamSlug, status?: string) => req<{ items: TestItem[] }>('/tests', { query: { family, status } }),
  testAction: (id: string, action: 'publish' | 'unpublish' | 'archive' | 'restore') => post<{ test?: TestItem }>(`/tests/${id}/${action}`),
  testPreview: (id: string) => post<{ token: string; attemptId?: string; expiresAt?: string; url?: string; playerUrl?: string }>(`/tests/${id}/preview`),
  importStage: (family: ExamSlug, form: FormData) => req<ImportStage>('/tests/import/stage', { method: 'POST', query: { family }, body: form }),
  importCommit: (stageId: string) => post<{ testId: string; status: 'DRAFT' }>(`/tests/import/${stageId}/commit`),
  importDrop: (stageId: string) => req<void>(`/tests/import/${stageId}`, { method: 'DELETE' }),
  siteStatus: (family: ExamSlug, status: 'open' | 'coming_soon') => patch<{ family: ExamSlug; siteStatus: string }>(`/tests/families/${family}/site-status`, { status }),

  /* §10 */
  insights: (scoreExam: 'ielts' | 'sat') => req<InsightsRes>('/stats/insights', { query: { scoreExam } }),

  /* analytics (analytics-design.md §12.2): `q` = { range } or { from, to } + tab filters */
  anLive: () => req<AnLiveRes>('/analytics/live'),
  anOverview: (q: Query) => req<AnOverviewRes>('/analytics/overview', { query: q }),
  anPages: (q: Query) => req<AnPagesRes>('/analytics/pages', { query: q }),
  anSources: (q: Query) => req<AnSourcesRes>('/analytics/sources', { query: q }),
  anGeo: (q: Query) => req<AnGeoRes>('/analytics/geo', { query: q }),
  anHours: (q: Query) => req<AnHoursRes>('/analytics/hours', { query: q }),
  anHoursDay: (q: Query) => req<AnHoursDayRes>('/analytics/hours/day', { query: q }),
  anExams: (q: Query) => req<AnExamsRes>('/analytics/exams', { query: q }),
  anPayments: (q: Query) => req<AnPaymentsRes>('/analytics/payments', { query: q }),

  /* §11 tickets */
  tickets: (q: Query) => req<TicketsRes>('/support-tickets', { query: q }),
  ticket: (id: string) => req<TicketDetailRes>(`/support-tickets/${id}`),
  reply: (id: string, body: { body: string; close?: boolean }, idem: string) =>
    post<{ message: TicketMessage; ticket: AdminTicketRow; mailQueued: boolean }>(`/support-tickets/${id}/messages`, body, idem),
  setTicketStatus: (id: string, status: 'OPEN' | 'CLOSED') => patch<{ ticket: AdminTicketRow }>(`/support-tickets/${id}`, { status }),

  /* §12 settings */
  settings: () => req<SettingsRes>('/settings'),
  saveSettings: (body: Partial<{ freeSectionEnabled: boolean; unlimitedEnabled: boolean; manualTransfer: Partial<{ cardNumber: string | null; cardHolder: string | null; telegram: string | null }> }>) =>
    patch<SettingsRes>('/settings', body),
  admins: () => req<{ items: AdminMember[] }>('/admins'),
  inviteAdmin: (body: { email: string; role: MockRole; fullName?: string }, idem: string) => post<{ admin: AdminMember }>('/admins/invite', body, idem),
  resendInvite: (id: string) => post<{ expiresAt: string }>(`/admins/${id}/resend-invite`),
  updateAdmin: (id: string, body: { role?: MockRole; status?: 'active' | 'disabled' }) => patch<{ admin: AdminMember }>(`/admins/${id}`, body),
  reset2fa: (id: string) => post<{ ok: true }>(`/admins/${id}/reset-2fa`),

  /* §13 audit */
  actions: (q: Query) => req<Page<AuditItem>>('/actions', { query: q }),
  actionsCsv: (q: Query) => reqBlob('/actions/export.csv', { query: q }),
};

export type { MockAdminAction };
