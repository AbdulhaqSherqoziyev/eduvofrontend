'use client';
/** Phone language bottom sheet (Mobile App.dc.html `shLang`). */
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LOCALES, LOCALE_NAMES, RTL_LOCALES, htmlLang, type MockLocale } from '@/i18n/locales';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';
import { BottomSheet } from './bottom-sheet';
import { useSwitchLocale } from './use-switch-locale';

/** Default: switch the site language. With `onPick`, it only reports the choice (onboarding step 4). */
export function LanguageSheet({ open, onClose, current, onPick }: { open: boolean; onClose: () => void; current?: MockLocale; onPick?: (l: MockLocale) => void }) {
  const t = useTranslations('common');
  const { lang: siteLang } = useLang();
  const lang = current ?? siteLang;
  const switchTo = useSwitchLocale();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return LOCALES.filter((l) => !s || LOCALE_NAMES[l].toLowerCase().includes(s) || l.includes(s));
  }, [q]);
  return (
    <BottomSheet open={open} title={t('lang.title')} onClose={onClose}>
      {/* search stays visible while the 40 rows scroll under it */}
      <div style={sx('position:sticky;top:0;z-index:1;background:var(--bg);padding:2px 0 6px;margin-top:-2px')}>
        <input className="m-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('lang.search')} aria-label={t('lang.search')}
          style={sx('height:48px;border-radius:14px;padding:0 14px;font-size:16px;width:100%')} />
      </div>
      <div className="m-rows" role="radiogroup" aria-label={t('lang.title')}>
        {list.map((l) => (
          <button key={l} type="button" role="radio" aria-checked={l === lang} lang={htmlLang(l)} onClick={() => { if (onPick) { onPick(l); return; } onClose(); void switchTo(l); }}
            style={sx('width:100%;min-height:52px;border:0;background:transparent;cursor:pointer;color:var(--ink);padding:0 16px;display:flex;align-items:center;gap:10px;text-align:start')}>
            <span dir={RTL_LOCALES.has(l) ? 'rtl' : 'ltr'} style={sx('flex:1;font-weight:700;font-size:15px;text-align:start')}>{LOCALE_NAMES[l]}</span>
            <span style={sx('font-size:11px;color:var(--mut);font-weight:800')}>{RTL_LOCALES.has(l) ? t('lang.rtl') : ''}</span>
            <span className="m-radio" style={sx('width:20px;height:20px')} />
          </button>
        ))}
      </div>
      {list.length === 0 && <span style={sx('font-size:14px;color:var(--mut)')}>{t('lang.empty')}</span>}
      <span style={sx('font-size:12px;color:var(--mut)')}>{t('lang.noteShort')}</span>
    </BottomSheet>
  );
}
