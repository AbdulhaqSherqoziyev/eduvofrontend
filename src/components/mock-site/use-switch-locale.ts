'use client';
import { isTranslated, type MockLocale } from '@/i18n/locales';
import { getSession } from '@/lib/mock/api/client';
import { patchMe } from '@/lib/mock/api/endpoints';
import { usePathRest } from '@/lib/mock/hooks/use-lang';
import { trackMockEvent } from '@/components/analytics/mock-tracker';

/**
 * Switch the interface language: remember it (NEXT_LOCALE cookie, read by the middleware on `/`),
 * sync it to the learner profile when the backend accepts that locale, then load the same page in it.
 */
export function useSwitchLocale() {
  const rest = usePathRest();
  return async (l: MockLocale) => {
    document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000;samesite=lax`;
    const s = getSession();
    // the API accepts only the MVP locales (contract §0.4) — others stay a client preference
    if (s.status === 'learner' && isTranslated(l) && s.learner.locale !== l) {
      try { await patchMe({ locale: l }); } catch { /* the page still switches */ }
    }
    // analytics (contract §4.4): from = current URL locale; sendBeacon survives the navigation below
    const seg = window.location.pathname.split('/').filter(Boolean);
    const from = seg[0] === 'm' ? seg[1] : seg[0];
    if (from && from !== l) trackMockEvent('lang_switch', { from, to: l });
    window.location.assign(`/${l}${rest}${window.location.search}${window.location.hash}`);
  };
}
