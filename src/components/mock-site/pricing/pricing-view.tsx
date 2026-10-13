'use client';
/**
 * Pricing — Pricing.dc.html (≥520) and Mobile App.dc.html `pricing` (<520) share one state:
 * exam, model, currency, bundle size, selected phone plan. Prices and availability come only from
 * the catalog (C1). Unlimited with `available:false` follows design addendum §4.
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { findProduct, readCurrency, saveCurrency, useCatalog } from '@/lib/mock/catalog';
import { fmtMoney, fmtPrice } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import type { Currency, OpenExamSlug, Product } from '@/lib/mock/api/types';
import { sx } from '@/lib/mock/sx';
import { WaitlistForm } from '../landing/waitlist';
import { Segmented } from '../segmented';
import { StickyCta } from '../sticky-cta';

type Model = 'per' | 'unl';
type PlanKey = 'section' | 'full' | 'b3' | 'b5' | 'b10' | 'unl';
const CURS: Currency[] = ['UZS', 'USD', 'EUR'];

function productFor(products: Product[] | undefined, exam: OpenExamSlug, k: PlanKey): Product | undefined {
  if (!products) return undefined;
  const c = { products } as Parameters<typeof findProduct>[0];
  if (k === 'section') return findProduct(c, exam, 'section');
  if (k === 'full') return findProduct(c, exam, 'full');
  if (k === 'unl') return findProduct(c, exam, 'unlimited');
  return findProduct(c, exam, 'bundle', Number(k.slice(1)));
}

const Bdi = ({ children }: { children: React.ReactNode }) => <bdi dir="ltr">{children}</bdi>;

export function PricingView() {
  const t = useTranslations('pricing');
  const tc = useTranslations('common');
  const { href } = useLang();
  const cat = useCatalog();
  const slow = useDelayedFlag(cat.status === 'loading');
  const [exam, setExam] = useState<OpenExamSlug>('ielts');
  const [model, setModel] = useState<Model>('per');
  const [cur, setCur] = useState<Currency>('UZS');
  const [bundle, setBundle] = useState<3 | 5 | 10>(5);
  const [plan, setPlan] = useState<PlanKey>('b5');

  // URL (?exam=sat&model=unl&cur=USD) and saved currency, after hydration (the page itself is static)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('exam') === 'sat') setExam('sat');
    if (q.get('model') === 'unl') setModel('unl');
    setCur(readCurrency(cat.status === 'ready' ? cat.data.suggestedCurrency : undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat.status]);
  const pickCur = (c: Currency) => { setCur(c); saveCurrency(c); };

  const products = cat.status === 'ready' ? cat.data.products : undefined;
  const p = useMemo(() => ({
    section: productFor(products, exam, 'section'), full: productFor(products, exam, 'full'),
    b3: productFor(products, exam, 'b3'), b5: productFor(products, exam, 'b5'), b10: productFor(products, exam, 'b10'), unl: productFor(products, exam, 'unl'),
  }), [products, exam]);
  const money = (prod: Product | undefined, field: 'price' | 'perMock' = 'price') => {
    const set = prod?.[field];
    return set ? fmtPrice(set, cur) : null;
  };
  const priceNode = (prod: Product | undefined, field: 'price' | 'perMock' = 'price', w = 140) => {
    if (cat.status === 'ready') return <Bdi>{money(prod, field) ?? '—'}</Bdi>;
    if (cat.status === 'error') return '—';
    return slow ? <span className="m-skel" style={{ display: 'inline-block', width: w, height: '0.8em', verticalAlign: 'middle' }} /> : <span style={{ display: 'inline-block', width: w }} />;
  };
  const examName = t(`exam.${exam}`);
  const unlAvailable = !!p.unl?.available;
  const soonPill = <span className="m-soon">{tc('chips.soon')}</span>;
  const bundleProd = p[`b${bundle}` as PlanKey];
  const checkoutHref = (prod: Product | undefined) => (prod && prod.available ? href(`/checkout?sku=${encodeURIComponent(prod.sku)}&cur=${cur}`) : undefined);
  const ielts = exam === 'ielts';

  /* ---------- phone plan list ---------- */
  const phoneKeys: PlanKey[] = model === 'unl' ? ['unl'] : ['section', 'full', 'b3', 'b5', 'b10'];
  const selected = phoneKeys.includes(plan) ? plan : phoneKeys[0];
  const selProd = p[selected];
  const planName = (k: PlanKey) => k === 'section' ? t('phone.planSection') : k === 'full' ? t('phone.planFull') : k === 'unl' ? t('phone.planUnl') : t('phone.planBundle', { n: Number(k.slice(1)) });
  const planNote = (k: PlanKey) => {
    if (k === 'section') return t(ielts ? 'phone.noteSectionIelts' : 'phone.noteSectionSat');
    if (k === 'full') return t('phone.noteFull');
    if (k === 'unl') return unlAvailable ? t('phone.noteUnl') : t('unlSoonBody');
    return t.rich('phone.noteBundle', { per: () => priceNode(p[k], 'perMock', 60) });
  };

  const loadError = cat.status === 'error' && (
    <div className="m-banner m-banner--err" role="alert" style={sx('align-items:center')}>
      <span style={sx('flex:1')}>{t('loadError')}</span>
      <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={cat.retry}>{t('retry')}</button>
    </div>
  );
  const freeHref = href(`/start/${exam}?mode=section`);

  return (
    <>
      {/* ================= desktop / tablet ================= */}
      <main className="m-desk" style={sx('max-width:1200px;margin:0 auto;padding:clamp(28px,5vw,64px) 20px 32px;display:flex;flex-direction:column;gap:32px')}>
        <div style={sx('display:flex;flex-direction:column;gap:12px;max-width:680px')}>
          <h1 className="m-h1 m-hyph" style={sx('font-size:clamp(30px,4vw,48px)')}>{t('h1')}</h1>
          <p className="m-lead">{t('sub')}</p>
        </div>

        <div style={sx('display:flex;gap:12px;flex-wrap:wrap;align-items:center')}>
          <Segmented label={t('exam.ielts') + ' / ' + t('exam.sat')} value={exam} onChange={setExam}
            items={[{ key: 'ielts', label: t('exam.ielts') }, { key: 'sat', label: t('exam.sat') }]} btnStyle={sx('padding:0 18px;font-weight:800')} />
          <Segmented label={t('model.per')} value={model} onChange={setModel}
            items={[{ key: 'per', label: t('model.per') }, { key: 'unl', label: t('model.unl'), pill: cat.status === 'ready' && !unlAvailable ? soonPill : undefined }]} />
          <Segmented label={t('phone.currency')} value={cur} onChange={pickCur} style={sx('margin-inline-start:auto')}
            items={CURS.map((c) => ({ key: c, label: c }))} btnStyle={sx('padding:0 14px;font-weight:800;font-size:13px')} />
        </div>

        <div style={sx('border-radius:20px;padding:16px 20px;background:var(--okBg);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center')}>
          <span style={sx('font-weight:700;font-size:14px;color:var(--ink)')}>{t.rich('free', { exam: examName, b: (c) => <span style={sx('color:var(--ok);font-weight:800')}>{c}</span> })}</span>
          <a href={freeHref} style={sx('font-weight:800;font-size:14px;color:var(--ok)')}>{t('freeCta')}</a>
        </div>

        {loadError}

        {model === 'per' && (
          <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px;align-items:stretch')}>
            <div className="m-card" style={sx('padding:28px;display:flex;flex-direction:column;gap:16px')}>
              <span style={sx('font-weight:800;font-size:17px')}>{t('section')}</span>
              <span style={sx('font-size:36px;font-weight:800;letter-spacing:var(--ls-h)')}>{priceNode(p.section)}</span>
              <span style={sx('color:var(--ink2);font-size:14px;line-height:1.55')}>{t(ielts ? 'sectionDescIelts' : 'sectionDescSat')}</span>
              <BuyLink href={checkoutHref(p.section)} soft label={t('buySection')} />
            </div>
            <div className="m-card" style={sx('padding:28px;display:flex;flex-direction:column;gap:16px;outline:2px solid var(--blue);outline-offset:-2px')}>
              <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap')}>
                <span style={sx('font-weight:800;font-size:17px')}>{t('full')}</span>
                {(p.full?.badge === 'most_chosen' || !p.full) && <span className="m-pill m-pill--blue">{tc('chips.mostChosen')}</span>}
              </div>
              <span style={sx('font-size:36px;font-weight:800;letter-spacing:var(--ls-h)')}>{priceNode(p.full)}</span>
              <span style={sx('color:var(--ink2);font-size:14px;line-height:1.55')}>{t(ielts ? 'fullDescIelts' : 'fullDescSat')}</span>
              <BuyLink href={checkoutHref(p.full)} label={t('buyFull')} />
            </div>
            <div className="m-card" style={sx('padding:28px;display:flex;flex-direction:column;gap:16px')}>
              <span style={sx('font-weight:800;font-size:17px')}>{t('bundle')}</span>
              <Segmented grid label={t('bundle')} value={String(bundle) as '3' | '5' | '10'} onChange={(k) => setBundle(Number(k) as 3 | 5 | 10)}
                items={(['3', '5', '10'] as const).map((n) => ({ key: n, label: t('bundleN', { n: Number(n) }) }))} btnStyle={sx('height:38px;padding:0 6px;font-weight:800;font-size:13px')} />
              <span style={sx('font-size:36px;font-weight:800;letter-spacing:var(--ls-h)')}>{priceNode(bundleProd)}</span>
              <span style={sx('color:var(--ink2);font-size:14px;line-height:1.55')}>
                {t.rich('bundleDesc', { per: () => priceNode(bundleProd, 'perMock', 70), pct: bundleProd?.savingPct ?? 0, months: bundleProd?.validityMonths ?? 12 })}
              </span>
              <BuyLink href={checkoutHref(bundleProd)} soft label={t('buyBundle', { n: bundle })} />
            </div>
          </div>
        )}

        {model === 'unl' && (
          <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:24px')}>
            {unlAvailable || cat.status !== 'ready' ? (
              <>
                <div className="m-card" style={sx('padding:32px;display:flex;flex-direction:column;gap:16px;outline:2px solid var(--blue);outline-offset:-2px')}>
                  <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}><span style={sx('font-weight:800;font-size:18px')}>{t('unlTitle', { exam: examName })}</span><span className="m-pill m-pill--blue">{t('monthly')}</span></div>
                  <div style={sx('display:flex;align-items:baseline;gap:8px;flex-wrap:wrap')}><span style={sx('font-size:44px;font-weight:800;letter-spacing:var(--ls-h)')}>{priceNode(p.unl)}</span><span style={sx('color:var(--mut);font-weight:700')}>{t('perMonth')}</span></div>
                  <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t('unlBody')}</span>
                  <BuyLink href={checkoutHref(p.unl)} label={t('subscribe')} grid />
                </div>
                <div style={sx('border-radius:24px;box-shadow:var(--inset);padding:32px;display:flex;flex-direction:column;gap:12px;justify-content:center')}>
                  <span style={sx('font-weight:800;font-size:16px')}>{t('paysOffTitle')}</span>
                  <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>
                    {t.rich('paysOff', {
                      two: () => (p.full ? <Bdi>{fmtMoney({ currency: cur, amountMinor: p.full.price[cur] * 2 })}</Bdi> : '—'),
                      unl: () => priceNode(p.unl, 'price', 80),
                    })}
                  </span>
                  <button type="button" onClick={() => setModel('per')} style={sx('align-self:flex-start;border:0;background:transparent;color:var(--blue);font-weight:800;font-size:14px;cursor:pointer;padding:0')}>{t('compareWithPer')}</button>
                </div>
              </>
            ) : (
              <>
                {/* addendum §4.1: not purchasable → no outline, muted price, Coming soon pill, Notify me instead of Subscribe */}
                <div className="m-card" style={sx('padding:32px;display:flex;flex-direction:column;gap:16px')}>
                  <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}><span style={sx('font-weight:800;font-size:18px')}>{t('unlTitle', { exam: examName })}</span><span className="m-pill m-pill--warn">{t('comingSoon')}</span></div>
                  <div style={sx('display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;color:var(--mut)')}><span style={sx('font-size:44px;font-weight:800;letter-spacing:var(--ls-h)')}>{priceNode(p.unl)}</span><span style={sx('font-weight:700')}>{t('perMonth')}</span></div>
                  <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t('unlSoonBody')}</span>
                  <WaitlistForm exam={exam === 'ielts' ? 'unlimited_ielts' : 'unlimited_sat'} />
                </div>
                <div style={sx('border-radius:24px;box-shadow:var(--inset);padding:32px;display:flex;flex-direction:column;gap:12px;justify-content:center')}>
                  <span style={sx('font-weight:800;font-size:16px')}>{t('untilTitle')}</span>
                  <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t.rich('untilBody', { per: () => priceNode(p.b5, 'perMock', 80) })}</span>
                  <button type="button" onClick={() => { setModel('per'); setBundle(5); }} style={sx('align-self:flex-start;border:0;background:transparent;color:var(--blue);font-weight:800;font-size:14px;cursor:pointer;padding:0')}>{t('seeBundles')}</button>
                </div>
              </>
            )}
          </div>
        )}

        <section className="m-card" style={sx('padding:clamp(16px,3vw,28px);overflow:auto')}>
          <div style={sx('font-weight:800;font-size:20px;margin-bottom:16px')}>{t('compare')}</div>
          <table className="m-table" style={sx('min-width:640px')}>
            <thead><tr>
              <th>&nbsp;</th><th>{t('col.free')}</th><th>{t('col.section')}</th><th>{t('col.full')}</th><th>{t('col.bundle')}</th>
              <th><span style={sx('display:inline-flex;gap:6px;align-items:center')}>{t('col.unl')}{cat.status === 'ready' && !unlAvailable && soonPill}</span></th>
            </tr></thead>
            <tbody>
              <tr>
                <td>{t('row.price')}</td><td><Bdi>{t('cell.zero')}</Bdi></td><td>{priceNode(p.section, 'price', 70)}</td><td>{priceNode(p.full, 'price', 70)}</td><td>{priceNode(bundleProd, 'price', 70)}</td>
                <td>
                  <span style={cat.status === 'ready' && !unlAvailable ? sx('color:var(--mut)') : undefined}>{t.rich('cell.perMo', { p: () => priceNode(p.unl, 'price', 70) })}</span>
                  {cat.status === 'ready' && !unlAvailable && <div style={sx('font-size:12px;font-weight:700;color:var(--warn)')}>{t('comingSoon')}</div>}
                </td>
              </tr>
              <tr><td>{t('row.sections')}</td><td>{t('cell.oneOnce')}</td><td>{t('cell.one')}</td><td>{t('cell.all')}</td><td>{t('cell.all')}</td><td>{t('cell.allNoLimit')}</td></tr>
              <tr><td>{t('row.instant')}</td>{[0, 1, 2, 3, 4].map((i) => <td key={i}>{t('cell.yes')}</td>)}</tr>
              {/* Free never includes Writing (TL decision Q6) → "—" instead of the design's "If Writing" */}
              <tr><td>{t('row.ai')}</td><td>{t('cell.dash')}</td><td>{ielts ? t('cell.ifWriting') : t('cell.dash')}</td>{[0, 1, 2].map((i) => <td key={i}>{ielts ? t('cell.yes') : t('cell.dash')}</td>)}</tr>
              <tr><td>{t('row.review')}</td>{[0, 1, 2, 3, 4].map((i) => <td key={i}>{t('cell.yes')}</td>)}</tr>
              <tr><td>{t('row.progress')}</td>{[0, 1, 2, 3, 4].map((i) => <td key={i}>{t('cell.yes')}</td>)}</tr>
              <tr><td>{t('row.validity')}</td><td>{t('cell.dash')}</td>{[0, 1, 2].map((i) => <td key={i}>{t('cell.months', { n: 12 })}</td>)}<td>{t('cell.whileSub')}</td></tr>
            </tbody>
          </table>
        </section>
        <div style={sx('font-size:13px;color:var(--mut);line-height:var(--lh-body)')}>{t.rich('note', { cur, a: (c) => <a href={href('/refunds')}>{c}</a> })}</div>
      </main>

      {/* ================= phone ================= */}
      <main className="m-phone m-with-cta-phone" style={sx('padding:8px 16px 24px;display:flex;flex-direction:column;gap:16px')}>
        <Segmented grid label={t('exam.ielts') + ' / ' + t('exam.sat')} value={exam} onChange={setExam} style={sx('border-radius:16px')}
          items={[{ key: 'ielts', label: t('exam.ielts') }, { key: 'sat', label: t('exam.sat') }]} btnStyle={sx('height:42px;border-radius:12px;font-weight:800;font-size:14px')} />
        <div style={sx('display:flex;gap:8px;align-items:center')}>
          <Segmented grid label={t('model.per')} value={model} onChange={setModel} style={sx('flex:1;padding:4px')}
            items={[{ key: 'per', label: t('model.per') }, { key: 'unl', label: t('model.unlShort'), pill: cat.status === 'ready' && !unlAvailable ? soonPill : undefined }]}
            btnStyle={sx('height:36px;padding:0 6px;font-size:12px')} />
          <select value={cur} onChange={(e) => pickCur(e.target.value as Currency)} aria-label={t('phone.currency')}
            style={sx('height:44px;border-radius:14px;border:0;background:var(--bg);box-shadow:var(--raise-sm);color:var(--ink);font-weight:800;font-size:13px;padding:0 10px')}>
            {CURS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={sx('border-radius:16px;padding:14px 16px;background:var(--okBg);display:flex;align-items:center;gap:10px')}>
          <span style={sx('flex:1;font-size:13px;font-weight:700;line-height:1.4')}>{t.rich('phone.freeShort', { exam: examName, b: (c) => <b style={sx('color:var(--ok)')}>{c}</b> })}</span>
          <a href={freeHref} style={sx('color:var(--ok);font-weight:800;font-size:13px')}>{t('phone.start')}</a>
        </div>
        {loadError}
        <div role="radiogroup" aria-label={t('phone.title')} style={sx('display:flex;flex-direction:column;gap:10px')}>
          {phoneKeys.map((k) => {
            const prod = p[k];
            const off = cat.status === 'ready' && !prod?.available;
            const badge = k === 'full' ? t('phone.mostChosen') : k === 'b5' ? t('phone.bestValue') : '';
            return (
              <button key={k} type="button" role="radio" className="m-radiocard" aria-checked={!off && selected === k} aria-disabled={off || undefined}
                onClick={() => { if (!off) setPlan(k); }} style={sx('min-height:72px;border-radius:20px;padding:14px 16px;display:flex;align-items:center;gap:14px')}>
                {off ? soonPill : <span className="m-radio" />}
                <span style={sx('flex:1;display:flex;flex-direction:column;gap:3px;min-width:0')}>
                  <span style={sx('display:flex;gap:6px;align-items:center;flex-wrap:wrap')}><b style={sx('font-size:15px')}>{planName(k)}</b>{badge && !off && <span style={sx('padding:2px 8px;border-radius:999px;background:var(--blue);color:#fff;font-size:10px;font-weight:800')}>{badge}</span>}</span>
                  <span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{planNote(k)}</span>
                </span>
                <b style={{ ...sx('font-size:15px;white-space:nowrap'), color: off ? 'var(--mut)' : undefined }}>{priceNode(prod, 'price', 70)}{k === 'unl' && t('phone.perMo')}</b>
              </button>
            );
          })}
        </div>
        {model === 'unl' && cat.status === 'ready' && !unlAvailable && (
          <div style={sx('border-radius:20px;box-shadow:var(--inset);padding:16px;display:flex;flex-direction:column;gap:8px')}>
            <b style={sx('font-size:14px')}>{t('untilTitle')}</b>
            <span style={sx('font-size:14px;color:var(--ink2);line-height:1.5')}>{t.rich('untilBody', { per: () => priceNode(p.b5, 'perMock', 70) })}</span>
            <button type="button" onClick={() => { setModel('per'); setPlan('b5'); }} style={sx('align-self:flex-start;border:0;background:transparent;color:var(--blue);font-weight:800;font-size:14px;cursor:pointer;padding:0')}>{t('seeBundles')}</button>
          </div>
        )}
        <div style={sx('border-radius:20px;box-shadow:var(--inset);padding:16px;display:flex;flex-direction:column;gap:10px')}>
          <b style={sx('font-size:14px')}>{t('phone.includes')}</b>
          {(['inc1', 'inc2', 'inc3', 'inc4', 'inc5'] as const).map((k) => (
            <span key={k} style={sx('display:flex;gap:10px;font-size:14px;color:var(--ink2)')}><span style={sx('width:6px;height:6px;border-radius:50%;background:var(--blue);margin-top:7px;flex:none')} />{t(`phone.${k}`)}</span>
          ))}
        </div>
        <span style={sx('font-size:12px;color:var(--mut);line-height:1.5')}>{t('phone.taxNote')}</span>
      </main>
      {/* sticky CTA hidden when nothing is purchasable (addendum §4.2) */}
      {selProd?.available && cat.status === 'ready' && (
        <StickyCta primary={{ label: t('phone.cta', { price: money(selProd) ?? '' }) + (selected === 'unl' ? t('phone.perMo') : ''), href: checkoutHref(selProd) }} />
      )}
    </>
  );
}

function BuyLink({ href, label, soft, grid }: { href?: string; label: string; soft?: boolean; grid?: boolean }) {
  const style = sx(`margin-top:auto;height:${grid ? 52 : 50}px;border-radius:14px;font-weight:700;font-size:16px;width:100%`);
  if (!href) return <button type="button" className={`m-btn ${soft ? 'm-btn--soft' : 'm-btn--primary'}`} disabled aria-disabled="true" style={style}>{label}</button>;
  return <a className={`m-btn ${soft ? 'm-btn--soft' : 'm-btn--primary'}`} href={href} style={style}>{label}</a>;
}
