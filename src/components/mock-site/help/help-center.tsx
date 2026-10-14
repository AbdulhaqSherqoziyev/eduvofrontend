'use client';
/**
 * Help center (README §12): searchable FAQ grouped by Exams / Payments / Account / Technical.
 * Search matches question and answer text in the current language; nothing found → a plain line
 * with the contact link.
 */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FaqDesktop, FaqPhone } from '@/components/mock-site/landing/faq';
import { RichLine } from '@/components/mock-site/legal/rich-line';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';

const GROUPS = ['exams', 'payments', 'account', 'technical'] as const;
type QA = { q: string; a: string };

const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').toLowerCase();

export function HelpCenter() {
  const t = useTranslations('help');
  const { lang, href } = useLang();
  const [q, setQ] = useState('');
  const faq = t.raw('faq') as Record<(typeof GROUPS)[number], QA[]>;
  const query = q.trim().toLowerCase();
  const groups = useMemo(
    () => GROUPS.map((g) => ({ g, items: faq[g].filter((f) => !query || plain(`${f.q} ${f.a}`).includes(query)) })).filter((x) => x.items.length),
    [faq, query],
  );
  const toItems = (items: QA[]) => items.map((f) => ({ q: f.q, a: <RichLine text={f.a} lang={lang} /> }));
  // a search opens the first match; browsing starts with everything closed
  const initial = query ? 0 : -1;

  return (
    <div style={sx('display:flex;flex-direction:column;gap:32px')}>
      <div role="search" style={sx('max-width:560px;width:100%')}>
        <input className="m-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} aria-label={t('search')} style={sx('width:100%')} />
      </div>
      {groups.length === 0 && (
        <p className="m-lead" role="status">{t('noResults', { q: q.trim() })} <Link href={href('/help/contact')} style={sx('font-weight:700')}>{t('contactCta')}</Link></p>
      )}
      {groups.map(({ g, items }) => (
        <section key={`${g}-${query}`} aria-labelledby={`help-${g}`} style={sx('display:flex;flex-direction:column;gap:14px')}>
          <h2 id={`help-${g}`} style={sx('margin:0;font-size:20px;font-weight:800;letter-spacing:var(--ls-t)')}>{t(`groups.${g}`)}</h2>
          <div className="m-desk"><FaqDesktop items={toItems(items)} initial={initial} /></div>
          <div className="m-phone"><FaqPhone items={toItems(items)} initial={initial} /></div>
        </section>
      ))}
      <div className="m-card" style={sx('padding:24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px')}>
        <b style={sx('font-size:18px')}>{t('stillNeed')}</b>
        <Link className="m-btn m-btn--primary" href={href('/help/contact')}>{t('contactCta')}</Link>
      </div>
    </div>
  );
}
