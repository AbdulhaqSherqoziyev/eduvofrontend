'use client';
/** Desktop/tablet language switcher (SiteHeader.dc.html): search, grid, RTL tag, note. No flags. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LOCALES, LOCALE_NAMES, RTL_LOCALES, htmlLang, type MockLocale } from '@/i18n/locales';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useSwitchLocale } from './use-switch-locale';

export function LanguageMenu() {
  const t = useTranslations('common');
  const { lang } = useLang();
  const switchTo = useSwitchLocale();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return LOCALES.filter((l) => !s || LOCALE_NAMES[l].toLowerCase().includes(s) || l.includes(s));
  }, [q]);

  return (
    <div ref={box} style={{ position: 'relative' }}>
      <button type="button" className="m-hbtn" aria-label={t('nav.language')} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="m-globe" aria-hidden />
        <span lang={htmlLang(lang)}>{LOCALE_NAMES[lang]}</span>
      </button>
      {open && (
        <div className="m-langpanel" role="dialog" aria-label={t('lang.title')}>
          <input ref={input} className="m-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('lang.search')} aria-label={t('lang.search')}
            style={{ height: 44, borderRadius: 12, padding: '0 14px', fontWeight: 500, fontSize: 14, marginBottom: 12 }} />
          <div className="m-langgrid">
            {list.map((l: MockLocale) => (
              <button key={l} type="button" className="m-langitem" lang={htmlLang(l)} dir={RTL_LOCALES.has(l) ? 'rtl' : 'ltr'}
                aria-current={l === lang} onClick={() => { setOpen(false); void switchTo(l); }}>
                <span>{LOCALE_NAMES[l]}</span><small>{RTL_LOCALES.has(l) ? t('lang.rtl') : ''}</small>
              </button>
            ))}
          </div>
          {list.length === 0 && <div style={{ padding: '10px 12px', fontSize: 14, color: 'var(--mut)' }}>{t('lang.empty')}</div>}
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--mut)' }}>{t('lang.note')}</div>
        </div>
      )}
    </div>
  );
}
