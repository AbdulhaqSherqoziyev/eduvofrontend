'use client';
/**
 * Desktop-only gate (design A17, brief §1). Overlays instead of unmounting, so
 * an attempt in progress keeps its timer, autosave and audio underneath.
 * No pixel number is shown to the student.
 */
import { Monitor } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { t, type Locale } from '@/lib/exam/i18n';

export function MinWidthGate({ min = 1280, locale, midAttempt, href = '/portal', children }: { min?: number; locale: Locale; midAttempt?: boolean; href?: string; children: ReactNode }) {
  const [w, setW] = useState<number | null>(null);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const narrow = w != null && w < min;
  return (
    <>
      {children}
      {narrow && (
        <div role="alertdialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--x-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: 440, maxWidth: '100%', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 22, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
            <Monitor size={32} color="var(--x-accent)" aria-hidden />
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--x-ink)' }}>{t('gate.title', locale)}</div>
            <div style={{ fontSize: 14.5, color: 'var(--x-sub)', lineHeight: 1.55 }}>
              {midAttempt ? t('gate.mid_attempt', locale) : t(w! < 1024 ? 'gate.body_mobile' : 'gate.body_narrow', locale)}
            </div>
            {!midAttempt && (
              <a href={href} style={{ marginTop: 6, height: 44, padding: '0 20px', borderRadius: 12, background: 'var(--x-accent)', color: '#fff', fontWeight: 800, fontSize: 14, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                {t('chrome.back_to_eduvo', locale)}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
