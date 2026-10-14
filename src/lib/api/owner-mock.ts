import { api } from './client';
import { cleanParams } from './http';
import type {
  KeysetPage, MockAdminAction, MockCreditKind, MockExam, MockExamCredits, MockPromo, MockPromoInput, MockStats, MockTicket,
  OwnerLearnerDetail, OwnerLearnerListItem, OwnerOrder, OwnerOrderDetail, OwnerOrderListItem,
} from '../types/owner-mock';

const B = '/platform/mock';

export interface OrdersQuery { status?: string; provider?: string; q?: string; learnerId?: string; cursor?: string; limit?: number }
export interface LearnersQuery { q?: string; status?: string; cursor?: string; limit?: number }

/** Owner panel for mock.eduvo.uz — platform JWT, permission `mock.manage` (contract §12). */
export const ownerMockApi = {
  orders: (p: OrdersQuery) => api.get<KeysetPage<OwnerOrderListItem>>(`${B}/orders`, { params: cleanParams(p) }).then((r) => r.data),
  order: (id: string) => api.get<OwnerOrderDetail>(`${B}/orders/${id}`).then((r) => r.data),
  markPaid: (id: string, body: { note?: string; providerRef?: string; amountMinor?: number }) =>
    api.post<{ order: OwnerOrder }>(`${B}/orders/${id}/mark-paid`, body).then((r) => r.data),
  markFailed: (id: string, body: { failureCode: 'DECLINED' | 'EXPIRED'; note?: string }) =>
    api.post<{ order: OwnerOrder }>(`${B}/orders/${id}/mark-failed`, body).then((r) => r.data),
  refund: (id: string, note: string) =>
    api.post<{ order: OwnerOrder; revoked: number; alreadyUsed: number }>(`${B}/orders/${id}/refund`, { note }).then((r) => r.data),

  learners: (p: LearnersQuery) => api.get<KeysetPage<OwnerLearnerListItem>>(`${B}/learners`, { params: cleanParams(p) }).then((r) => r.data),
  learner: (id: string) => api.get<OwnerLearnerDetail>(`${B}/learners/${id}`).then((r) => r.data),
  grant: (id: string, body: { exam: MockExam; kind: MockCreditKind; qty: number; validityMonths?: number; reason: string }) =>
    api.post<{ credits: MockExamCredits }>(`${B}/learners/${id}/grant`, body).then((r) => r.data),
  revoke: (id: string, body: { exam: MockExam; kind: MockCreditKind; qty: number; reason: string }) =>
    api.post<{ revoked: number; credits: MockExamCredits }>(`${B}/learners/${id}/revoke`, body).then((r) => r.data),
  lock: (id: string, reason: string) => api.post<{ status: string }>(`${B}/learners/${id}/lock`, { reason }).then((r) => r.data),
  unlock: (id: string, reason: string) => api.post<{ status: string }>(`${B}/learners/${id}/unlock`, { reason }).then((r) => r.data),

  promos: () => api.get<{ items: MockPromo[] }>(`${B}/promo-codes`).then((r) => r.data),
  createPromo: (body: MockPromoInput) => api.post<{ promo: MockPromo }>(`${B}/promo-codes`, body).then((r) => r.data),
  updatePromo: (id: string, body: Partial<MockPromoInput>) => api.patch<{ promo: MockPromo }>(`${B}/promo-codes/${id}`, body).then((r) => r.data),

  stats: (p: { from?: string; to?: string }) => api.get<MockStats>(`${B}/stats`, { params: cleanParams(p) }).then((r) => r.data),
  actions: (p: { kind?: 'alert' | 'admin'; cursor?: string; limit?: number }) =>
    api.get<KeysetPage<MockAdminAction>>(`${B}/actions`, { params: cleanParams(p) }).then((r) => r.data),
  tickets: (p: { status?: string; cursor?: string; limit?: number }) =>
    api.get<KeysetPage<MockTicket>>(`${B}/support-tickets`, { params: cleanParams(p) }).then((r) => r.data),
  updateTicket: (id: string, status: 'OPEN' | 'CLOSED') =>
    api.patch<{ ticket: MockTicket }>(`${B}/support-tickets/${id}`, { status }).then((r) => r.data),
};
