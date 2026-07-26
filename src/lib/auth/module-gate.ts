/**
 * Which modules this center has switched on — the synchronous twin of
 * `permissions.can()`.
 *
 * `visibleNavItems()` is a plain function, not a hook, so the answer has to be
 * readable without a network round trip. The keys therefore live in
 * localStorage next to the session and are refreshed from every GET/PATCH
 * /api/modules response (spec §B.1.2). Subscribers are notified so the sidebar
 * re-renders the moment the first response lands — no page reload needed.
 *
 * This is UX gating only: the backend gate (ModulesGuard) is what actually
 * enforces access, and it answers 403 MODULE_DISABLED regardless of what this
 * cache says.
 */

const KEY = 'edu_erp_modules';

interface StoredGate {
  /** Grandfathered: everything is open, never filter anything out. */
  g: boolean;
  /** Enabled module keys. */
  k: string[];
  /** `canView`: this user reaches a real /modules screen (drives the nav item). */
  v: boolean;
}

const isBrowser = () => typeof window !== 'undefined';

/** `undefined` = not read from storage yet, `null` = nothing stored. */
let cache: StoredGate | null | undefined;
let version = 0;
const listeners = new Set<() => void>();

function read(): StoredGate | null {
  if (!isBrowser()) return null;
  if (cache !== undefined) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as StoredGate) : null;
  } catch {
    cache = null;
  }
  return cache;
}

function emit(): void {
  version += 1;
  listeners.forEach((l) => l());
}

function same(a: StoredGate | null, b: StoredGate): boolean {
  return (
    !!a && a.g === b.g && a.v === b.v && a.k.length === b.k.length && a.k.every((k, i) => k === b.k[i])
  );
}

/** Cache the gate from a GET/PATCH /api/modules payload. */
export function setModuleGate(view: {
  grandfathered: boolean;
  canView: boolean;
  modules: { key: string; enabled: boolean }[];
}): void {
  if (!isBrowser()) return;
  const next: StoredGate = {
    g: view.grandfathered,
    k: view.modules.filter((m) => m.enabled).map((m) => m.key),
    v: view.canView,
  };
  // Same answer as before -> no write, no re-render.
  if (same(read(), next)) return;
  cache = next;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

/** Drop the cache (logout, or switching into another branch = another tenant). */
export function clearModuleGate(): void {
  cache = null;
  if (isBrowser()) window.localStorage.removeItem(KEY);
  emit();
}

/**
 * Is this module usable? An unknown answer (nothing cached yet) is TRUE on
 * purpose: a nav item that disappears for a second and comes back reads as
 * "the system broke", which is exactly the panic §B.1.2 is written to avoid.
 */
export function moduleOn(key: string): boolean {
  const gate = read();
  if (!gate) return true;
  return gate.g || gate.k.includes(key);
}

/**
 * Does /modules show this user a real screen, rather than the "this section is
 * for the director" dead end?
 *
 * Straight from the backend's `canView`, which is true for a center's
 * management whether or not the center is grandfathered — deliberately wider
 * than `canManage`, because a grandfathered director can change nothing yet
 * must still reach the read-only screen (§B.4). No role list and no combining
 * of flags happens here: one question, one field, answered server-side.
 *
 * Unknown answers false — what it guards is a management screen, not daily
 * work, so appearing late is harmless while appearing wrongly is not.
 */
export function canViewModulesScreen(): boolean {
  return read()?.v ?? false;
}

export function subscribeModuleGate(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Monotonic counter for useSyncExternalStore — a stable snapshot value. */
export function moduleGateVersion(): number {
  return version;
}
