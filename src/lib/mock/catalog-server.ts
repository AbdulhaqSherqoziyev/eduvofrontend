/**
 * Build/ISR-time catalog fetch (C1 is public and cached 5 min server-side). Needs MOCK_API_INTERNAL
 * (e.g. http://127.0.0.1:8000/api on the server). Without it, or when the API is down, pages render
 * the price skeleton and the client fetches `/api/mock/catalog` itself — never placeholder prices.
 */
import type { Catalog } from './api/types';

export const CATALOG_REVALIDATE = 300;

export async function fetchCatalogServer(): Promise<Catalog | null> {
  const base = process.env.MOCK_API_INTERNAL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/mock/catalog`, { next: { revalidate: CATALOG_REVALIDATE }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return (await res.json()) as Catalog;
  } catch {
    return null;
  }
}
