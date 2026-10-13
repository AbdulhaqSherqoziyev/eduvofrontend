'use client';
/** Catalog context: server-fetched catalog if available, else one client fetch (skeleton after 300 ms, error state). */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
    if (initial) return;
    const ac = load();
    return () => ac.abort();
  }, [initial, load]);
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function findProduct(c: Catalog, exam: OpenExamSlug, kind: ProductKind, qty = 1): Product | undefined {
  return c.products.find((p) => p.exam === exam && p.kind === kind && (kind !== 'bundle' || p.qty === qty));
}

/** Currency preference: ?cur= → saved → catalog suggestion → UZS. */
const CUR_KEY = 'eduvo_mock_currency';
export function readCurrency(suggested?: Currency): Currency {
  try {
    const q = new URLSearchParams(window.location.search).get('cur');
    if (q === 'UZS' || q === 'USD' || q === 'EUR') return q;
    const s = localStorage.getItem(CUR_KEY);
    if (s === 'UZS' || s === 'USD' || s === 'EUR') return s;
  } catch { /* ignore */ }
  return suggested ?? 'UZS';
}
export function saveCurrency(c: Currency) {
  try { localStorage.setItem(CUR_KEY, c); } catch { /* ignore */ }
}
