'use client';
/** Contact channels: email (mailto + copy) and Telegram (only when NEXT_PUBLIC_MOCK_SUPPORT_TELEGRAM is set). */
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/mock-site/toast';
import { SUPPORT_EMAIL, SUPPORT_TELEGRAM } from '@/lib/mock/legal';
import { sx } from '@/lib/mock/sx';

const CARD = sx('padding:24px;display:flex;flex-direction:column;gap:12px;min-width:0');
const ICON = sx('width:44px;height:44px;border-radius:12px;box-shadow:var(--inset);display:grid;place-items:center;font-weight:800;font-size:18px;color:var(--blue)');

export function ContactChannels() {
  const t = useTranslations('help.contact');
  const toast = useToast();
  const copy = async () => {
    try { await navigator.clipboard.writeText(SUPPORT_EMAIL); toast(t('copied')); } catch { /* clipboard blocked: the address stays visible */ }
  };
  return (
    <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:20px')}>
      <div className="m-card" style={CARD}>
        <span style={ICON} aria-hidden>@</span>
        <b style={sx('font-size:18px')}>{t('emailTitle')}</b>
        <a href={`mailto:${SUPPORT_EMAIL}`} style={sx('font-size:17px;font-weight:800;word-break:break-all')}><bdi dir="ltr">{SUPPORT_EMAIL}</bdi></a>
        <span style={sx('color:var(--ink2);font-size:14px;line-height:1.55')}>{t('emailText')}</span>
        <div style={sx('display:flex;flex-wrap:wrap;gap:10px;margin-top:4px')}>
          <a className="m-btn m-btn--primary" href={`mailto:${SUPPORT_EMAIL}`}>{t('emailCta')}</a>
          <button type="button" className="m-btn m-btn--soft" onClick={copy}>{t('copy')}</button>
        </div>
      </div>
      {SUPPORT_TELEGRAM && (
        <div className="m-card" style={CARD}>
          <span style={ICON} aria-hidden>✈</span>
          <b style={sx('font-size:18px')}>{t('telegramTitle')}</b>
          <a href={`https://t.me/${SUPPORT_TELEGRAM.slice(1)}`} target="_blank" rel="noopener noreferrer" style={sx('font-size:17px;font-weight:800')}><bdi dir="ltr">{SUPPORT_TELEGRAM}</bdi></a>
          <span style={sx('color:var(--ink2);font-size:14px;line-height:1.55')}>{t('telegramText')}</span>
          <div style={sx('display:flex;flex-wrap:wrap;gap:10px;margin-top:4px')}>
            <a className="m-btn m-btn--soft" href={`https://t.me/${SUPPORT_TELEGRAM.slice(1)}`} target="_blank" rel="noopener noreferrer">{t('telegramCta')} ↗</a>
          </div>
        </div>
      )}
    </div>
  );
}
