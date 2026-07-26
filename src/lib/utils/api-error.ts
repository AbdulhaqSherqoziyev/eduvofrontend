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

/** Pull a human message out of an Axios/API error, falling back to a default. */
export function apiErrorMessage(error: unknown, fallback = 'Xatolik yuz berdi'): string {
  const data = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const msg = data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  return msg ?? fallback;
}
