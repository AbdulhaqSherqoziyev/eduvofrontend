'use client';
/**
 * Player.dc.html "Section submitted": shown after the last section instead of jumping straight to
 * the result. One primary action — See your result (after Writing the result opens in its pending
 * state). Learner's site language (player namespace).
 */
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { sx } from '@/lib/mock/sx';

export function MockDoneCard({ resultHref, writing }: { resultHref: string; writing: boolean }) {
  const t = useTranslations('player.done');
  return (
    <div dir="auto" style={sx('min-height:100vh;display:grid;place-items:center;padding:32px;background:var(--bg)')}>
      <div style={sx('max-width:520px;width:100%;border-radius:24px;box-shadow:var(--raise);background:var(--bg);padding:36px;display:flex;flex-direction:column;gap:16px;color:var(--ink)')}>
        <span className="m-pill m-pill--ok" style={sx('align-self:flex-start;font-size:12px;font-weight:800')}>{t('chip')}</span>
        <div style={sx('font-size:28px;font-weight:800;letter-spacing:-0.02em')}>{t('title')}</div>
        <div style={sx('color:var(--ink2);font-size:15px;line-height:1.6')}>{writing ? t('bodyWriting') : t('body')}</div>
        <Link className="m-btn m-btn--primary" href={resultHref} style={sx('height:54px;border-radius:14px;font-weight:800;font-size:16px')}>{t('cta')}</Link>
      </div>
    </div>
  );
}
