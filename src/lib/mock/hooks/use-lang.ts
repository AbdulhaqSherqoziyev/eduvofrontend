'use client';
import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { isLocale, type MockLocale } from '@/i18n/locales';

/** Current locale + helper that prefixes app paths: `href('/pricing')` → `/uz/pricing`. */
export function useLang() {
  const lang = useLocale() as MockLocale;
  // stable between renders: pages list `href` in effect/callback deps (an unstable one re-ran fetches in a loop)
  const href = useCallback((p: string) => `/${lang}${p}`, [lang]);
  return { lang, href };
}

/** Visible path without the locale prefix (`/ar/pricing` → `/pricing`). Tolerates the internal `/m/` prefix. */
export function usePathRest(): string {
  const p = usePathname() || '/';
  const parts = p.split('/').filter(Boolean);
  if (parts[0] === 'm') parts.shift();
  if (isLocale(parts[0])) parts.shift();
  return parts.length ? `/${parts.join('/')}` : '';
}
