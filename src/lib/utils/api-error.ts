/**
 * Module key from a `403 MODULE_DISABLED`, or null for every other error.
 *
 * Returns '' when the body carries no key — the lock screen still belongs on
 * screen, it just falls back to generic copy. Callers must therefore test
 * `!== null`, not truthiness.
 */
export function moduleDisabledKey(error: unknown): string | null {
  const data = (error as { response?: { data?: { error?: string; module?: string } } })?.response
    ?.data;
  if (data?.error !== 'MODULE_DISABLED') return null;
  return data.module ?? '';
}

/**
 * Pull a human message out of an Axios/API error, falling back to a default.
 *
 * Only 400/403/409 bodies are trusted. Those are written for this user — the
 * module errors in tenant-modules.service.ts are UX copy, not diagnostics, and
 * showing them beats a generic line the director cannot act on. Everything else
 * (500 above all) carries framework English like "Internal server error", which
 * has no business appearing in a dialog that is about to move money.
 *
 * Writing a new 400/403/409 message on the backend means writing UI copy.
 */
const SPEAKS_TO_USER = new Set([400, 403, 409]);

export function apiErrorMessage(error: unknown, fallback = 'Xatolik yuz berdi'): string {
  const res = (error as { response?: { status?: number; data?: { message?: string | string[] } } })
    ?.response;
  if (!res || !SPEAKS_TO_USER.has(res.status ?? 0)) return fallback;
  const msg = res.data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  return msg ?? fallback;
}
