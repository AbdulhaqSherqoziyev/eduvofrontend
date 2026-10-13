/** Contract endpoints (`_api-contract.md` section numbers in brackets). */
import { api, clearSession, setAuthSession, setLearner } from './client';
import type {
  AttemptListItem, AttemptMode, AuthSession, Catalog, CheckoutMethods, CreatedAttempt, Currency, Dashboard, ExamCredits,
  Learner, MePatch, MockResultExt, OpenExamSlug, Order, PaymentMethodGroup, Quote, SectionKey, ShareCard, StartInfo, WaitlistTopic,
} from './types';

/* ---- §1 auth ---- */
export async function signup(body: { email: string; password: string; locale: string; country?: string; timezone?: string; termsVersion: string; marketingOptIn?: boolean; turnstile: string }) {
  const s = await api<AuthSession & { verificationSent: true }>('/mock/auth/signup', { method: 'POST', body, auth: false, cookie: true });
  setAuthSession(s);
  return s;
}
export async function login(body: { email: string; password: string; turnstile?: string }) {
  const s = await api<AuthSession>('/mock/auth/login', { method: 'POST', body, auth: false, cookie: true });
  setAuthSession(s);
  return s;
}
export async function googleAuth(body: { idToken: string; locale: string; country?: string; timezone?: string; termsVersion: string; marketingOptIn?: boolean }) {
  const s = await api<AuthSession & { isNew: boolean }>('/mock/auth/google', { method: 'POST', body, auth: false, cookie: true });
  setAuthSession(s);
  return s;
}
export async function logout(all = false) {
  try { await api<void>('/mock/auth/logout', { method: 'POST', body: { all }, cookie: true }); } finally { clearSession(); }
}
export const verifyEmail = (token: string) =>
  api<{ emailVerified: true; learner: Learner | null }>('/mock/auth/verify-email', { method: 'POST', body: { token } });
export const resendVerification = () => api<{ sentTo: string }>('/mock/auth/verify-email/resend', { method: 'POST' });
export const forgotPassword = (email: string, turnstile: string) =>
  api<Record<string, never>>('/mock/auth/password/forgot', { method: 'POST', body: { email, turnstile }, auth: false });
export async function resetPassword(token: string, password: string, passwordConfirm: string) {
  const s = await api<AuthSession>('/mock/auth/password/reset', { method: 'POST', body: { token, password, passwordConfirm }, auth: false, cookie: true });
  setAuthSession(s);
  return s;
}

/* ---- §2 me ---- */
export async function getMe() {
  const r = await api<{ learner: Learner; serverNow: string }>('/mock/me');
  setLearner(r.learner);
  return r.learner;
}
export async function patchMe(body: MePatch) {
  const r = await api<{ learner: Learner; serverNow: string }>('/mock/me', { method: 'PATCH', body });
  setLearner(r.learner);
  return r.learner;
}

/* ---- §3 catalog ---- */
export const getCatalog = (signal?: AbortSignal) => api<Catalog>('/mock/catalog', { auth: false, signal });
export const joinWaitlist = (body: { exam: WaitlistTopic; email?: string; locale: string; turnstile?: string }) =>
  api<{ subscribed: true }>('/mock/waitlist', { method: 'POST', body });

/* ---- §4–5 ---- */
export const getCredits = () => api<{ credits: ExamCredits[]; serverNow: string }>('/mock/credits');
export const getDashboard = (signal?: AbortSignal) => api<Dashboard>('/mock/dashboard', { signal });
export const getAttempts = (q: { status?: 'in_progress' | 'completed'; exam?: OpenExamSlug; cursor?: string; limit?: number }) => {
  const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));
  return api<{ items: AttemptListItem[]; nextCursor: string | null; serverNow: string }>(`/mock/attempts?${p}`);
};

/* ---- §6 start ---- */
export const getStart = (exam: OpenExamSlug, q: { mode: AttemptMode; section?: SectionKey; test?: string }, signal?: AbortSignal) => {
  const p = new URLSearchParams({ mode: q.mode, ...(q.section ? { section: q.section } : {}), ...(q.test ? { test: q.test } : {}) });
  return api<StartInfo>(`/mock/start/${exam}?${p}`, { signal });
};
export const createAttempt = (body: { exam: OpenExamSlug; mode: AttemptMode; sectionKey?: SectionKey; testId?: string; charge?: 'auto'; idempotencyKey: string }) =>
  api<CreatedAttempt>('/mock/attempts', { method: 'POST', body });
export const emailStartLink = (body: { exam: OpenExamSlug; mode: AttemptMode; sectionKey?: SectionKey; testCode?: string }) =>
  api<{ sentTo: string }>('/mock/start/email-link', { method: 'POST', body });

/* ---- §8 results ---- */
/** EXAM §1.10 body is typed loosely here; the results page reads only what it renders. */
export type MockResult = Record<string, unknown> & { status?: string; mock: MockResultExt; serverNow: string };
export const getResult = (attemptId: string, signal?: AbortSignal) => api<MockResult>(`/mock/attempts/${encodeURIComponent(attemptId)}/result`, { signal });
export const createShare = (attemptId: string) =>
  api<{ token: string; url: string; card: ShareCard }>(`/mock/attempts/${encodeURIComponent(attemptId)}/share`, { method: 'POST' });

/* ---- §9 checkout ---- */
export const getMethods = (currency: Currency) => api<CheckoutMethods>(`/mock/checkout/methods?currency=${currency}`);
export const getQuote = (body: { sku: string; currency: Currency; promoCode?: string }) =>
  api<{ quote: Quote; serverNow: string }>('/mock/checkout/quote', { method: 'POST', body });
export const createOrder = (body: { sku: string; currency: Currency; promoCode?: string; methodGroup: PaymentMethodGroup; idempotencyKey: string; returnUrl?: string }) =>
  api<{ order: Order; serverNow: string }>('/mock/orders', { method: 'POST', body });
export const getOrder = (id: string, signal?: AbortSignal) =>
  api<{ order: Order; credits: ExamCredits; serverNow: string }>(`/mock/orders/${encodeURIComponent(id)}`, { signal });
export const cancelOrder = (id: string) => api<{ order: Order }>(`/mock/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
/** O6 receipt is an attachment; the page opens it as a same-origin link. */
export const receiptUrl = (id: string) => `${process.env.NEXT_PUBLIC_MOCK_API_BASE || '/api'}/mock/orders/${encodeURIComponent(id)}/receipt`;
