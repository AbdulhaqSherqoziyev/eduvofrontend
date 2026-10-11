'use client';
/** Settings pop-over (design E5/F): 3 colour themes with swatches + interface language. */
import { Check, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import type { ThemeKey } from '@/lib/exam/engine/state';
import type { TextKey } from '@/lib/exam/i18n';

const THEMES: { key: ThemeKey; label: TextKey; bg: string; fg: string }[] = [
  { key: 'standard', label: 'chrome.theme_standard', bg: '#FFFFFF', fg: '#1E2A3A' },
  { key: 'contrast', label: 'chrome.theme_wob', bg: '#000000', fg: '#FFFFFF' },
  { key: 'cream', label: 'chrome.theme_cream', bg: '#FBF7E6', fg: '#2B2618' },
];

export function LangSwitch() {
  const { s, setUi } = useExam();
  const { t } = useT();
  return (
    <div role="radiogroup" aria-label={t('chrome.interface_lang')} style={{ display: 'inline-flex', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 10, padding: 3 }}>
      {(['en', 'uz'] as const).map((l) => {
        const on = s.ui.locale === l;
        return (
          <button key={l} type="button" role="radio" aria-checked={on} onClick={() => setUi({ locale: l })}
            style={{ width: 120, height: 32, borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, background: on ? 'var(--x-sel-bg)' : 'transparent', color: on ? 'var(--x-sel-fg)' : 'var(--x-sub)' }}>
            {t(l === 'en' ? 'chrome.interface_en' : 'chrome.interface_uz')}
          </button>
        );
      })}
    </div>
  );
}

export function SettingsMenu() {
  const { s, setUi } = useExam();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        style={{ height: 36, padding: '0 12px', borderRadius: 9, border: '1.5px solid var(--x-line)', background: 'transparent', color: 'var(--x-ink)', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Settings size={14} aria-hidden /> {t('chrome.settings')}
      </button>
      {open && (
        <div role="menu" className="x-pop" style={{ position: 'absolute', right: 0, top: 44, width: 290, background: 'var(--x-panel)', border: '1px solid var(--x-pop-border)', boxShadow: 'var(--x-pop-shadow)', borderRadius: 14, padding: 12, zIndex: 40, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: 'var(--x-muted)', padding: '2px 6px' }}>{t('chrome.theme').toUpperCase()}</div>
          {THEMES.map((th) => {
            const on = s.ui.theme === th.key;
            return (
              <button key={th.key} type="button" role="menuitemradio" aria-checked={on} onClick={() => setUi({ theme: th.key })}
                style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 8px', borderRadius: 9, border: 'none', background: on ? 'var(--x-sel-bg)' : 'transparent', color: on ? 'var(--x-sel-fg)' : 'var(--x-ink)', fontSize: 13.5, fontWeight: 700, textAlign: 'left' }}>
                <span aria-hidden style={{ width: 28, height: 22, borderRadius: 6, background: th.bg, color: th.fg, border: '1px solid var(--x-line)', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Aa</span>
                <span style={{ flex: 1 }}>{t(th.label)}</span>
                {on && <Check size={15} aria-hidden />}
              </button>
            );
          })}
          <div style={{ height: 1, background: 'var(--x-line)', margin: '6px 0' }} />
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: 'var(--x-muted)', padding: '2px 6px' }}>{t('chrome.interface_lang').toUpperCase()}</div>
          <div style={{ padding: '0 4px 4px' }}><LangSwitch /></div>
        </div>
      )}
    </div>
  );
}
