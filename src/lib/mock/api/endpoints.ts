/** Contract endpoints (`_api-contract.md` section numbers in brackets). */
import { api, clearSession, currentAccessToken, getSession, refreshSession, setAuthSession, setLearner } from './client';
import type {
  AttemptListItem, AttemptMode, AuthSession, Catalog, CheckoutMethods, CreatedAttempt, Currency, Dashboard, ExamCredits,
  Learner, MePatch, MockResultExt, OpenExamSlug, Order, PaymentMethodGroup, ProgressSeries, Quote, Recommendation, SectionKey, ShareCard,
  StartInfo, WaitlistTopic, WeakType,
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
  try { await api<void>('/mock/auth/logout', { method: 'POST', body: { all }, cookie: true }); } finally { clearSession(true); }
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
/**
 * C1 with the visitor's time zone (v0.5: Asia/Tashkent → UZ → UZS) and, for a learner, country +
 * Bearer (products then reflect the tests this learner has not seen). Guests send no token.
 */
export const getCatalog = (signal?: AbortSignal) => {
  const q = new URLSearchParams();
  try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; if (tz) q.set('tz', tz); } catch { /* old browser */ }
  const s = getSession();
  if (s.status === 'learner' && s.learner.country) q.set('country', s.learner.country);
  const qs = q.toString();
  return api<Catalog>(`/mock/catalog${qs ? `?${qs}` : ''}`, { auth: !!currentAccessToken(), signal });
};
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
export const getSharedCard = (token: string) => api<{ card: ShareCard; serverNow: string }>(`/mock/share/${encodeURIComponent(token)}`, { auth: false });
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
/**
 * Paddle overlay step for the admin analytics (analytics-api-contract §10.3): only that the window opened,
 * closed or failed (+ Paddle's short code) — no card data, no email. Fire-and-forget: errors are swallowed.
 */
export function postCheckoutEvent(orderId: string, kind: 'paddle_open' | 'paddle_close' | 'paddle_error', code?: string) {
  const body = kind === 'paddle_error' && code && /^[A-Za-z0-9_.:-]{1,60}$/.test(code) ? { kind, code } : { kind };
  void api<{ recorded: boolean }>(`/mock/orders/${encodeURIComponent(orderId)}/checkout-event`, { method: 'POST', body }).catch(() => undefined);
}
export const cancelOrder = (id: string) => api<{ order: Order }>(`/mock/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
/* ---- §9 O5, §11 U1–U4 (v0.5) ---- */
export const listOrders = (cursor?: string) => api<{ items: Order[]; nextCursor: string | null; serverNow: string }>(`/mock/orders?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
export const deleteAccount = (body: { password?: string; googleIdToken?: string; reason?: string }) =>
  api<{ status: 'DELETION_PENDING'; deletionScheduledAt: string }>('/mock/me/delete', { method: 'POST', body });
export async function restoreAccount() {
  const r = await api<{ learner: Learner }>('/mock/me/restore', { method: 'POST' });
  setLearner(r.learner);
  return r.learner;
}
export const contactSupport = (body: { name: string; email?: string; topic: 'exams' | 'payments' | 'account' | 'technical' | 'other'; message: string; testCode?: string; orderId?: string; locale: string; turnstile?: string }) =>
  api<{ ticketId: string }>('/mock/support/contact', { method: 'POST', body });
/** Authenticated attachment (U1 export, O6 receipt) → saved via a blob link. Throws MockApiError-like codes. */
async function downloadAuthed(path: string, fallbackName: string) {
  const call = () => fetch(`${process.env.NEXT_PUBLIC_MOCK_API_BASE || '/api'}${path}`, {
    headers: currentAccessToken() ? { Authorization: `Bearer ${currentAccessToken()}` } : {},
  });
  let res = await call();
  if (res.status === 401 && (await refreshSession(true))) res = await call();
  if (!res.ok) {
    let code = `HTTP_${res.status}`;
    try { const j = await res.json(); if (typeof j.error === 'string') code = j.error; } catch { /* not JSON */ }
    throw new Error(code);
  }
  const cd = res.headers.get('content-disposition') ?? '';
  const name = /filename="?([^";]+)"?/.exec(cd)?.[1] ?? fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export const exportMyData = () => downloadAuthed('/mock/me/export', `eduvo-mock-export-${new Date().toISOString().slice(0, 10)}.json`);

/** O6 receipt (text/html attachment, Bearer-protected) → saved via a blob link. */
export const downloadReceipt = (id: string, filename: string) => downloadAuthed(`/mock/orders/${encodeURIComponent(id)}/receipt`, filename);

/* ---- §5 D2 progress, §1 A10 password change ---- */
export const getProgress = (exam: OpenExamSlug, signal?: AbortSignal) =>
  api<ProgressResp>(`/mock/progress?exam=${exam}`, { signal });
export interface ProgressResp {
  exam: OpenExamSlug;
  series: ProgressSeries;
  history: Array<{ attemptId: string; at: string; testCode: string; mode: AttemptMode; sectionKey: SectionKey | null; overall: number | null; sections: Partial<Record<SectionKey, number | null>> }>;
  weakestTypes: WeakType[];
  recommendations: Recommendation[];
  serverNow: string;
}
export async function changePassword(body: { currentPassword?: string; newPassword: string }) {
  const s = await api<AuthSession>('/mock/auth/password/change', { method: 'POST', body, cookie: true });
  setAuthSession(s);
  return s;
}
