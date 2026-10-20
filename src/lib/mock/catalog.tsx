'use client';
/** Catalog context: server-fetched catalog if available, else one client fetch (skeleton after 300 ms, error state). */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCatalog } from './api/endpoints';
import type { Catalog, Currency, OpenExamSlug, Product, ProductKind } from './api/types';

type CatalogState = { status: 'loading' } | { status: 'ready'; data: Catalog } | { status: 'error'; retry: () => void };
const Ctx = createContext<CatalogState>({ status: 'loading' });
export const useCatalog = () => useContext(Ctx);

export function CatalogProvider({ initial, children }: { initial: Catalog | null; children: React.ReactNode }) {
  const [state, setState] = useState<CatalogState>(initial ? { status: 'ready', data: initial } : { status: 'loading' });
  const load = useCallback(() => {
    setState({ status: 'loading' });
    const ac = new AbortController();
    getCatalog(ac.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((e: unknown) => { if ((e as Error)?.name !== 'AbortError') setState({ status: 'error', retry: load }); });
    return ac;
  }, []);
  useEffect(() => {
    if (!initial) { const ac = load(); return () => ac.abort(); }
    // the build/ISR copy knows neither the visitor's zone (currency suggestion) nor the learner (fresh tests):
    // refresh quietly in the background, keeping the server prices on screen meanwhile
    const ac = new AbortController();
    getCatalog(ac.signal).then((data) => setState({ status: 'ready', data })).catch(() => undefined);
    return () => ac.abort();
  }, [initial, load]);

  // Currency: the server render (and the first client render) use the catalog default, so there is no
  // hydration mismatch; ?cur= / the saved choice are applied after mount, and only if still on the public list.
  const data = state.status === 'ready' ? state.data : null;
  const allowed = useMemo(() => publicCurrencies(data), [data]);
  const allowedKey = allowed.join(',');
  const suggested = data?.suggestedCurrency;
  const [picked, setPicked] = useState<Currency | null>(null);
  useEffect(() => {
    if (data) setPicked(readCurrency(allowed, suggested));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedKey, suggested, !!data]);
  const cur: CurrencyState = useMemo(() => ({
    currency: picked && allowed.includes(picked) ? picked : defaultCurrency(allowed, suggested),
    currencies: allowed,
    ready: !!data,
    setCurrency: (c: Currency) => { if (allowed.includes(c)) { setPicked(c); saveCurrency(c); } },
  }), [picked, allowed, suggested, data]);
  return <Ctx.Provider value={state}><CurCtx.Provider value={cur}>{children}</CurCtx.Provider></Ctx.Provider>;
}

export function findProduct(c: Catalog, exam: OpenExamSlug, kind: ProductKind, qty = 1): Product | undefined {
  return c.products.find((p) => p.exam === exam && p.kind === kind && (kind !== 'bundle' || p.qty === qty));
}

/**
 * Currency (owner 10-20: the public site sells only in the catalog's `currencies`, prod = ['USD']).
 * Preference: ?cur= → saved → catalog suggestion → first public currency; anything off the list
 * (an old `?cur=UZS` link, a saved "UZS") is ignored. The list always comes from the catalog.
 */
const CUR_KEY = 'eduvo_mock_currency';
/** Only until the catalog arrives — no price is drawn before that (skeleton), so this never reaches a learner as a price. */
const PRE_CATALOG: Currency = 'USD';
export function publicCurrencies(c: Catalog | null | undefined): Currency[] {
  if (!c) return [PRE_CATALOG];
  return c.currencies?.length ? c.currencies : [c.suggestedCurrency];
}
export function defaultCurrency(allowed: readonly Currency[], suggested?: Currency): Currency {
  return suggested && allowed.includes(suggested) ? suggested : allowed[0] ?? PRE_CATALOG;
}
export function readCurrency(allowed: readonly Currency[], suggested?: Currency): Currency {
  const ok = (v: string | null): v is Currency => !!v && (allowed as readonly string[]).includes(v);
  try {
    const q = new URLSearchParams(window.location.search).get('cur');
    if (ok(q)) return q;
    const s = localStorage.getItem(CUR_KEY);
    if (ok(s)) return s;
  } catch { /* ignore */ }
  return defaultCurrency(allowed, suggested);
}
export function saveCurrency(c: Currency) {
  try { localStorage.setItem(CUR_KEY, c); } catch { /* ignore */ }
}

interface CurrencyState { currency: Currency; currencies: Currency[]; ready: boolean; setCurrency: (c: Currency) => void }
const CurCtx = createContext<CurrencyState>({ currency: PRE_CATALOG, currencies: [PRE_CATALOG], ready: false, setCurrency: () => undefined });
/** Selected public currency + the public list (inside <CatalogProvider>). */
export const useCurrency = () => useContext(CurCtx);
