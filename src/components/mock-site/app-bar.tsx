'use client';
/**
 * Phone app bar (<520px, Mobile App.dc.html + addendum §6): 52px grid — back or logo · title · actions.
 * Rendered next to SiteHeader; CSS shows exactly one of them.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { langShort } from '@/i18n/locales';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { LanguageSheet } from './language-sheet';

export interface AppBarProps {
  /** `logo` (tab screens, landing) or `back` with a fallback URL when there is no history */
  left?: 'logo' | 'back' | 'none';
  backHref?: string;
  onBack?: () => void;
  title?: string;
  lang?: boolean;
  login?: boolean;
  skip?: { label?: string; onClick: () => void };
  share?: () => void;
  /** landing and tab screens: no hairline */
  flat?: boolean;
}

export function AppBar({ left = 'logo', backHref, onBack, title, lang, login, skip, share, flat }: AppBarProps) {
  const t = useTranslations('common');
  const { lang: cur, href } = useLang();
  const [sheet, setSheet] = useState(false);
  const back = () => {
    if (onBack) return onBack();
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) window.history.back();
    else window.location.assign(backHref ?? href(''));
  };
  return (
    <>
      <div className={`m-appbar m-phone${flat ? ' m-appbar--flat' : ''}`}>
        <div className="m-appbar__side">
          {left === 'back' && <button type="button" className="m-back" aria-label={t('nav.back')} onClick={back} />}
          {left === 'logo' && (
            <a className="m-applogo" href={href('')} aria-label={t('brand.home')}>
              <span className="m-applogo__mark" aria-hidden>e</span>
              <span className="m-applogo__word" dir="ltr" style={{ display: 'flex', gap: 4 }} aria-hidden>Eduvo<span style={{ color: 'var(--blue)' }}>Mock</span></span>
            </a>
          )}
        </div>
        <span className="m-appbar__title">{title}</span>
        <div className="m-appbar__side m-appbar__side--end">
          {lang && <button type="button" className="m-langpill" aria-label={t('nav.language')} onClick={() => setSheet(true)}>{langShort(cur)}</button>}
          {login && <a className="m-applogin" href={href('/login')}>{t('nav.login')}</a>}
          {skip && <button type="button" className="m-appghost" onClick={skip.onClick}>{skip.label ?? t('nav.skip')}</button>}
          {share && <button type="button" className="m-langpill" style={{ fontSize: 13 }} onClick={share}>{t('nav.share')}</button>}
        </div>
      </div>
      {lang && <LanguageSheet open={sheet} onClose={() => setSheet(false)} />}
    </>
  );
}
