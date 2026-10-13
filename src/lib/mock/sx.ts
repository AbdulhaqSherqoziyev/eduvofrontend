/**
 * `sx('display:flex;gap:8px')` → React style object. Lets mock-site components carry the design
 * files' inline CSS (design/mock-site/*.dc.html) verbatim, so values stay 1:1 with the design.
 * Results are cached per string (the inputs are static literals).
 */
import type { CSSProperties } from 'react';

const cache = new Map<string, CSSProperties>();

export function sx(css: string): CSSProperties {
  const hit = cache.get(css);
  if (hit) return hit;
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop || !value) continue;
    const key = prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = value;
  }
  cache.set(css, out as CSSProperties);
  return out as CSSProperties;
}
