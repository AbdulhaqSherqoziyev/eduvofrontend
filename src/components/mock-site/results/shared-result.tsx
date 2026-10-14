'use client';
/** Public result card behind a share link (R4 GET /mock/share/:token). No personal data beyond the optional first name. */
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MockApiError } from '@/lib/mock/api/client';
import { getSharedCard } from '@/lib/mock/api/endpoints';
import type { ShareCard } from '@/lib/mock/api/types';
import { fmtDateLong } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';
import { ShareCardView } from './share-modal';

const SEC: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', reading_writing: 'Reading and Writing', math: 'Math' };

export function SharedResult({ token }: { token: string }) {
  const t = useTranslations('results.sharePage');
  const tm = useTranslations('results.shareModal');
  const tc = useTranslations('common');
  const { lang, href } = useLang();
  const [card, setCard] = useState<ShareCard | null>(null);
  const [err, setErr] = useState<'gone' | 'load' | null>(null);
  const load = useCallback(() => {
    setErr(null);
    getSharedCard(token).then((r) => setCard(r.card)).catch((e: unknown) => setErr(e instanceof MockApiError && e.status === 404 ? 'gone' : 'load'));
  }, [token]);
  useEffect(() => { load(); }, [load]);
  const slow = useDelayedFlag(!card && !err);

  const view = card && {
    label: card.mode === 'full' ? (card.exam === 'ielts' ? t('overall') : t('total')) : t('section', { section: SEC[card.sectionKey ?? ''] ?? '' }),
    score: card.scoreLabel,
    sub: card.exam === 'ielts'
      ? (card.mode === 'full' ? `IELTS Academic${card.cefr ? ` · CEFR ${card.cefr}` : ''}` : `IELTS Academic · ${SEC[card.sectionKey ?? ''] ?? ''}`)
      : (card.mode === 'full' ? ['Digital SAT', ...(card.sections ?? []).filter((x) => x.label).map((x) => `${x.key === 'reading_writing' ? 'R&W' : SEC[x.key]} ${x.label}`)].join(' · ') : `Digital SAT · ${SEC[card.sectionKey ?? ''] ?? ''}`),
  };

  return (
    <main style={sx('max-width:960px;margin:0 auto;padding:clamp(24px,5vw,56px) 16px 56px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:32px;align-items:center')}>
      <div style={sx('width:min(420px,100%);justify-self:center')}>
        {view ? <ShareCardView v={view} footer={tm('footer')} /> : !err && slow ? <div className="m-skel" style={sx('aspect-ratio:1/1;border-radius:20px')} /> : null}
      </div>
      <div style={sx('display:flex;flex-direction:column;gap:14px')}>
        {err ? (
          <div className={`m-banner ${err === 'gone' ? 'm-banner--warn' : 'm-banner--err'}`} role="alert" style={sx('align-items:center')}>
            <span style={sx('flex:1')}>{err === 'gone' ? t('gone') : t('err')}</span>
            {err === 'load' && <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={load}>{t('retry')}</button>}
          </div>
        ) : (
          <>
            <h1 className="m-h1" style={sx('font-size:clamp(26px,3.4vw,38px);letter-spacing:var(--ls-h)')}>{card?.firstName ? t('titleName', { name: card.firstName }) : t('title')}</h1>
            {card && <span style={sx('font-size:14px;color:var(--mut);font-weight:700')}>{t('taken', { date: fmtDateLong(lang, card.takenAt) })}</span>}
          </>
        )}
        <p className="m-lead" style={sx('margin:0')}>{t('body')}</p>
        <Link className="m-btn m-btn--primary" href={href('/signup?next=free')} style={sx('height:54px;padding:0 26px;font-weight:800;font-size:16px;align-self:flex-start')}>{t('cta')}</Link>
        <span style={sx('font-size:12px;color:var(--mut);line-height:1.5')}>{tc('legalLine')}</span>
      </div>
    </main>
  );
}
