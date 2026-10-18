/**
 * admin-mock access token (contract §0.2): memory + sessionStorage (never localStorage), 12 h TTL,
 * no refresh. Cleared on 401 / logout.
 */
const KEY = 'eduvoAdminToken';
let mem: { token: string; expiresAt: string } | null = null;

export function getAdminToken(): string | null {
  if (mem && Date.parse(mem.expiresAt) > Date.now()) return mem.token;
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { token: string; expiresAt: string };
    if (!v?.token || Date.parse(v.expiresAt) <= Date.now()) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    mem = v;
    return v.token;
  } catch {
    return mem?.token ?? null;
  }
}

export function setAdminToken(token: string, expiresAt: string) {
  mem = { token, expiresAt };
  try { sessionStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* memory only */ }
}

export function clearAdminToken() {
  mem = null;
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** `/login?next=<current path>` (same-site path only). */
export function loginUrl(next?: string) {
  const n = next ?? (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
  return n && n !== '/' && !n.startsWith('/login') ? `/login?next=${encodeURIComponent(n)}` : '/login';
}
