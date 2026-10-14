'use client';
/**
 * Attempt closed without a result (contract v0.5 §18.2: TOO_MANY_SKIPS { attemptCancelled },
 * R1 409 ATTEMPT_CANCELLED { refunded }). Same card in the player and on the result URL.
 */
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';

export function CancelledCard({ refunded = true, full = false }: { refunded?: boolean; full?: boolean }) {
  const t = useTranslations('common.cancelled');
  const { href } = useLang();
  return (
    <div style={sx(`${full ? 'min-height:100vh;' : 'min-height:60vh;'}display:grid;place-items:center;padding:32px 16px;background:var(--bg)`)}>
      <div role="status" style={sx('max-width:520px;width:100%;border-radius:24px;box-shadow:var(--raise);background:var(--bg);padding:32px;display:flex;flex-direction:column;gap:14px;color:var(--ink)')}>
        <span className="m-pill m-pill--warn" style={sx('align-self:flex-start;font-size:12px;font-weight:800')}>{t('chip')}</span>
        <div style={sx('font-size:26px;font-weight:800;letter-spacing:-0.02em')}>{t('title')}</div>
        <div style={sx('color:var(--ink2);font-size:15px;line-height:1.6')}>{refunded ? t('body') : t('bodyNoRefund')}</div>
        <Link className="m-btn m-btn--primary" href={href('/dashboard')} style={sx('height:52px;border-radius:14px;font-weight:800;font-size:16px')}>{t('cta')}</Link>
      </div>
    </div>
  );
}
