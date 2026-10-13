'use client';
/**
 * Checkout form — Checkout.dc.html `form` (≥520) and Mobile App `checkout` (<520), MVP `manual`
 * payment (design addendum §3): Card / Wallet stay in the segment with a "Soon" pill, Local is the
 * default; USD/EUR show the "switch to UZS" banner. Quote = O1, methods = O8, order = O2.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MockApiError } from '@/lib/mock/api/client';
import { createOrder, getMethods, getQuote, resendVerification } from '@/lib/mock/api/endpoints';
import type { CheckoutMethods, Currency, PaymentMethodGroup, Quote } from '@/lib/mock/api/types';
import { fmtMoney } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useLearner } from '@/lib/mock/hooks/use-learner';
import { sx } from '@/lib/mock/sx';
import { AppBar } from '../app-bar';
import { Segmented } from '../segmented';
import { StickyCta } from '../sticky-cta';
import { useToast } from '../toast';

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
type Banner = { kind: 'warn' | 'err'; text: React.ReactNode } | null;

function VerifyFirst() {
  const t = useTranslations('checkout');
  const [sent, setSent] = useState(false);
  return <>{t('verifyFirst')} <button type="button" onClick={() => { void resendVerification().finally(() => setSent(true)); }} style={sx('border:0;background:transparent;color:var(--blue);font-weight:800;cursor:pointer;padding:0')}>{sent ? t('resent') : t('resend')}</button></>;
}

export function CheckoutForm() {
  const t = useTranslations('checkout');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const { href } = useLang();
  const learner = useLearner();
  const [sku, setSku] = useState<string | null>(null);
  const [cur, setCur] = useState<Currency>('UZS');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteErr, setQuoteErr] = useState(false);
  const [methods, setMethods] = useState<CheckoutMethods | null>(null);
  const [methodsErr, setMethodsErr] = useState(false);
  const [group, setGroup] = useState<PaymentMethodGroup>('local');
  const [soonNote, setSoonNote] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoErr, setPromoErr] = useState(false);
  const [applied, setApplied] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [expired, setExpired] = useState(false);
  const idem = useRef(uuid());
  const soonTimer = useRef<number>();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = q.get('sku');
    if (!s) { router.replace(href('/pricing')); return; }
    if (/_unlimited_/.test(s)) { /* unlimited may be unavailable: the quote decides */ }
    setSku(s);
    const c = q.get('cur');
    if (c === 'USD' || c === 'EUR' || c === 'UZS') setCur(c);
    setExpired(q.get('expired') === '1');
  }, [href, router]);

  const loadQuote = useCallback(async (code?: string) => {
    if (!sku) return;
    setQuoteErr(false);
    try {
      const r = await getQuote({ sku, currency: cur, promoCode: code });
      setQuote(r.quote); setApplied(code); setPromoErr(false);
    } catch (e) {
      if (e instanceof MockApiError && e.code === 'PROMO_INVALID') { setPromoErr(true); return; }
      if (e instanceof MockApiError && (e.code === 'PRODUCT_UNAVAILABLE' || e.code === 'PRODUCT_NOT_FOUND')) { router.replace(href('/pricing?model=unl')); return; }
      setQuoteErr(true);
    }
  }, [sku, cur, router, href]);
  useEffect(() => {
    if (learner && sku) void loadQuote(applied);
    // re-quote when the product or currency changes; promo changes go through Apply
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learner, sku, cur]);

  useEffect(() => {
    if (!learner) return;
    setMethodsErr(false);
    getMethods(cur).then((m) => {
      setMethods(m);
      const first = m.methods.find((x) => x.enabled);
      setGroup(first?.group ?? 'local');
    }).catch(() => setMethodsErr(true));
  }, [learner, cur]);

  const slow = useDelayedFlag(!quote && !quoteErr);
  const enabled = (g: PaymentMethodGroup) => !!methods?.methods.find((m) => m.group === g && m.enabled);
  const localProviders = methods?.methods.find((m) => m.group === 'local')?.providers ?? [];
  const anyEnabled = !!methods?.methods.some((m) => m.enabled);
  const nonUzs = cur !== 'UZS';
  const total = quote ? fmtMoney(quote.total) : '';
  const free = !!quote && quote.total.amountMinor === 0;
  const canPay = !!quote && !busy && (free || (enabled(group) && !nonUzs));

  const pickGroup = (g: PaymentMethodGroup) => {
    if (!enabled(g) && g !== 'local') {
      setSoonNote(true);
      window.clearTimeout(soonTimer.current);
      soonTimer.current = window.setTimeout(() => setSoonNote(false), 4000);
      return;
    }
    setGroup(g);
  };

  const pay = async () => {
    if (!sku || !canPay) return;
    setBusy(true); setBanner(null);
    try {
      const r = await createOrder({ sku, currency: cur, promoCode: applied, methodGroup: free ? 'local' : group, idempotencyKey: idem.current });
      router.push(href(`/checkout/orders/${r.order.id}`));
    } catch (e) {
      setBusy(false);
      idem.current = uuid();
      if (!(e instanceof MockApiError)) { setBanner({ kind: 'err', text: t('serverErr') }); return; }
      switch (e.code) {
        case 'TOO_MANY_PENDING_ORDERS': setBanner({ kind: 'warn', text: <>{t('tooMany')} <a href={href('/dashboard')} style={sx('font-weight:800')}>{t('seeOrders')}</a></> }); break;
        case 'EMAIL_NOT_VERIFIED': setBanner({ kind: 'warn', text: <VerifyFirst /> }); break;
        case 'PROMO_INVALID': setPromoErr(true); setApplied(undefined); break;
        case 'PRODUCT_UNAVAILABLE': router.replace(href('/pricing?model=unl')); break;
        case 'METHOD_NOT_AVAILABLE': setCur(cur); break;
        case 'RATE_LIMITED': setBanner({ kind: 'warn', text: tc('errors.rateLimited', { sec: e.retryAfterSec ?? 60 }) }); break;
        default: setBanner({ kind: 'err', text: <>{t('serverErr')}</> });
      }
    }
  };

  const product = quote?.product;
  const examTag = product ? (product.exam === 'ielts' ? 'IELTS ACADEMIC' : 'DIGITAL SAT') : '';
  const planName = product ? (product.kind === 'bundle' ? t('plan.bundle', { n: product.qty }) : t(`plan.${product.kind}`)) : '';
  const planNote = product ? (product.kind === 'bundle' ? t('planNote.bundle', { n: product.qty, months: product.validityMonths ?? 12 }) : t(`planNote.${product.kind}`, { months: product.validityMonths ?? 12 })) : '';
  const ctaLabel = busy ? t('creating') : free ? t('getCredits') : nonUzs || !enabled(group) ? t('continueNoTotal') : t('continue', { total });

  const soonPill = <span className="m-soon">{t('soon')}</span>;
  const promoForm = (phone: boolean) => (
    <>
      <form onSubmit={(e) => { e.preventDefault(); if (promo.trim()) void loadQuote(promo.trim().toUpperCase()); }} style={sx('display:flex;gap:8px')}>
        <input className="m-input" value={promo} onChange={(e) => { setPromo(e.target.value); setPromoErr(false); }} placeholder={t('promoPh')} aria-label={t('promoPh')} aria-invalid={promoErr}
          style={sx(`flex:1;height:46px;border-radius:${phone ? 14 : 12}px;padding:0 14px;font-size:${phone ? 15 : 14}px;font-weight:700;text-transform:uppercase`)} />
        <button type="submit" className="m-btn m-btn--soft" style={sx(`height:46px;padding:0 ${phone ? 14 : 16}px;border-radius:${phone ? 14 : 12}px;color:var(--blue);font-weight:800;font-size:14px`)}>{t('apply')}</button>
      </form>
      {quote?.promo && <span style={sx('font-size:13px;font-weight:700;color:var(--ok)')}>{t('promoApplied', { code: quote.promo.code, pct: quote.promo.percentOff })}</span>}
      {promoErr && <span role="alert" style={sx('font-size:13px;font-weight:700;color:var(--err)')}>{t('promoInvalid')}</span>}
    </>
  );
  const bannerEl = banner && <div className={`m-banner m-banner--${banner.kind}`} role="alert">{banner.text}</div>;
  const expiredEl = expired && <div className="m-banner m-banner--warn" role="status">{t('expiredBanner')}</div>;
  const quoteErrEl = quoteErr && <div className="m-banner m-banner--err" role="alert" style={sx('align-items:center')}><span style={sx('flex:1')}>{t('serverErr')}</span><button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => void loadQuote(applied)}>{t('tryAgain')}</button></div>;
  const currencyBanner = nonUzs && (
    <div className="m-banner m-banner--warn" role="status" style={sx('align-items:center;flex-wrap:wrap')}>
      <span style={sx('flex:1;min-width:200px')}>{t('currencySoon')}</span>
      <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => setCur('UZS')}>{t('switchUzs')}</button>
    </div>
  );
  const methodsState = methodsErr ? <div className="m-banner m-banner--err" role="alert">{t('methodsErr')}</div>
    : methods && !anyEnabled && !nonUzs ? <div className="m-banner m-banner--warn">{t('methodsEmpty')} <a href={href('/help/contact')}>{tc('footer.contact')}</a></div> : null;
  const sk = (w: string, h = 16) => slow ? <span className="m-skel" style={{ display: 'inline-block', width: w, height: h }} /> : <span style={{ display: 'inline-block', width: w }} />;

  return (
    <>
      <AppBar left="back" title={t('phone.title')} backHref={href('/pricing')} />
      {/* ================= ≥520 ================= */}
      <main className="m-desk" style={sx('max-width:1080px;margin:0 auto;padding:clamp(20px,4vw,48px) 20px 64px')}>
        <h1 className="m-h1" style={sx('margin:0 0 24px;font-size:clamp(26px,3vw,36px);letter-spacing:var(--ls-h)')}>{t('h1')}</h1>
        <div style={sx('display:flex;flex-direction:column;gap:16px;margin-bottom:16px')}>{expiredEl}{quoteErrEl}</div>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));gap:24px;align-items:start')}>
          <div style={sx('display:flex;flex-direction:column;gap:24px;min-width:0')}>
            <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:16px')}>
              <div style={sx('font-weight:800;font-size:17px')}>{t('method')}</div>
              {!methods && !methodsErr ? <div className="m-skel" style={sx('height:52px;border-radius:14px')} /> : (
                <Segmented grid label={t('method')} value={group} onChange={pickGroup} style={sx('gap:8px')} btnStyle={sx('height:42px;font-size:13px;padding:0 8px')}
                  items={(['card', 'wallet', 'local'] as const).map((g) => ({ key: g, label: t(g), pill: !enabled(g) && g !== 'local' ? soonPill : undefined, disabled: !enabled(g) && g !== 'local' }))} />
              )}
              {soonNote && <div role="status" style={sx('padding:10px 14px;border-radius:12px;background:var(--hover);font-size:13px;font-weight:600;color:var(--ink2)')}>{t('cardSoonNote')}</div>}
              {methodsState}
              {currencyBanner}
              {!nonUzs && enabled('local') && (
                <>
                  <div style={sx('display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px')}>
                    {(localProviders.length ? localProviders : [{ code: 'manual', name: '' }]).map((p) => (
                      <button key={p.code} type="button" role="radio" aria-checked="true" className="m-radiocard" style={sx('height:72px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px')}>
                        <span className="m-mono" style={sx('width:70%;height:24px;border-radius:6px;background:repeating-linear-gradient(135deg,var(--hover) 0 6px,transparent 6px 12px);font-size:10px;color:var(--mut);display:grid;place-items:center')}>logo</span>
                        <span style={sx('font-size:12px;font-weight:700')}>{p.name || t('manualTile')}</span>
                      </button>
                    ))}
                  </div>
                  <div style={sx('font-size:12px;color:var(--mut);line-height:1.5')}>{t('manualNote')}</div>
                </>
              )}
              {bannerEl}
              <button type="button" className="m-btn m-btn--primary" disabled={!canPay} onClick={() => void pay()} style={sx('height:54px;font-weight:800;font-size:16px')}>{busy && <span className="m-spin" aria-hidden />}{ctaLabel}</button>
              <div style={sx('font-size:12px;color:var(--mut);line-height:1.5')}>{t('secure')}</div>
            </div>
          </div>

          <div className="m-card" style={sx('padding:24px;display:flex;flex-direction:column;gap:16px')}>
            <div style={sx('font-weight:800;font-size:17px')}>{t('summary')}</div>
            <div style={sx('display:flex;justify-content:space-between;gap:12px;align-items:flex-start')}>
              <div style={sx('display:flex;flex-direction:column;gap:4px')}>
                <span className="m-eyebrow" style={{ ...sx('letter-spacing:.05em'), color: product ? `var(--${product.exam})` : undefined }} lang="en">{examTag || sk('90px', 12)}</span>
                <span style={sx('font-weight:800;font-size:16px')}>{planName || sk('120px')}</span>
                <span style={sx('font-size:13px;color:var(--mut)')}>{planNote}</span>
              </div>
              <span style={sx('font-weight:800;font-size:16px;white-space:nowrap')}>{quote ? <bdi dir="ltr">{fmtMoney(quote.subtotal)}</bdi> : sk('80px')}</span>
            </div>
            <div style={sx('height:1px;background:var(--line)')} />
            {promoForm(false)}
            <div style={sx('display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--ink2)')}>
              {quote && quote.discount.amountMinor > 0 && <div style={sx('display:flex;justify-content:space-between')}><span>{t('discount')}</span><span style={sx('color:var(--ok);font-weight:700')}><bdi dir="ltr">−{fmtMoney(quote.discount)}</bdi></span></div>}
              <div style={sx('display:flex;justify-content:space-between')}><span>{t('taxes')}</span><span>{t('included')}</span></div>
            </div>
            <div style={sx('display:flex;justify-content:space-between;align-items:baseline;padding:14px 16px;border-radius:16px;box-shadow:var(--inset)')}><span style={sx('font-weight:800')}>{t('total')}</span><span style={sx('font-size:24px;font-weight:800')}>{quote ? <bdi dir="ltr">{total}</bdi> : sk('100px', 22)}</span></div>
            <a href={href(`/pricing${product ? `?exam=${product.exam}` : ''}`)} style={sx('font-size:13px;font-weight:700')}>{t('changePlan')}</a>
          </div>
        </div>
      </main>

      {/* ================= <520 ================= */}
      <main className="m-phone m-with-cta-phone" style={sx('padding:8px 16px 24px;display:flex;flex-direction:column;gap:16px')}>
        {expiredEl}{quoteErrEl}
        <div className="m-card" style={sx('border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:12px')}>
          <div style={sx('display:flex;justify-content:space-between;gap:12px')}>
            <span style={sx('display:flex;flex-direction:column;gap:2px')}>
              <span className="m-eyebrow" style={{ ...sx('font-size:11px;letter-spacing:.05em'), color: product ? `var(--${product.exam})` : undefined }} lang="en">{examTag || sk('80px', 11)}</span>
              <b style={sx('font-size:16px')}>{planName || sk('100px')}</b>
              <span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{planNote}</span>
            </span>
            <b style={sx('font-size:16px;white-space:nowrap')}>{quote ? <bdi dir="ltr">{fmtMoney(quote.subtotal)}</bdi> : sk('70px')}</b>
          </div>
          {promoForm(true)}
          {quote && quote.discount.amountMinor > 0 && <div style={sx('display:flex;justify-content:space-between;font-size:13px;color:var(--ink2)')}><span>{t('discount')}</span><span style={sx('color:var(--ok);font-weight:700')}><bdi dir="ltr">−{fmtMoney(quote.discount)}</bdi></span></div>}
          <div style={sx('display:flex;justify-content:space-between;font-size:13px;color:var(--ink2)')}><span>{t('taxes')}</span><span>{t('included')}</span></div>
        </div>
        <b style={sx('font-size:16px')}>{t('phone.payWith')}</b>
        {currencyBanner}
        {methodsState}
        <div className="m-rows" role="radiogroup" aria-label={t('phone.payWith')}>
          {([['card', t('card'), t('phone.cardNote')], ['wallet', t('phone.applePay'), ''], ['wallet2', t('phone.googlePay'), '']] as const).map(([k, name, note]) => (
            <button key={k} type="button" role="radio" aria-checked={false} aria-disabled={!enabled(k === 'card' ? 'card' : 'wallet') || undefined}
              onClick={() => { if (!enabled(k === 'card' ? 'card' : 'wallet')) toast(t('cardSoonToast')); else setGroup(k === 'card' ? 'card' : 'wallet'); }}
              style={sx('width:100%;min-height:58px;border:0;background:transparent;cursor:pointer;color:var(--ink);padding:0 16px;display:flex;align-items:center;gap:12px;text-align:start')}>
              <span style={sx('width:40px;height:28px;border-radius:7px;flex:none;background:repeating-linear-gradient(135deg,var(--hover) 0 5px,transparent 5px 10px);box-shadow:var(--inset);opacity:.55')} />
              <span style={sx('flex:1;display:flex;flex-direction:column;gap:1px;opacity:.55')}><b style={sx('font-size:15px')}>{name}</b>{note && <span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{note}</span>}</span>
              {soonPill}
            </button>
          ))}
          {(localProviders.length ? localProviders : [{ code: 'manual', name: '' }]).map((p) => (
            <button key={p.code} type="button" role="radio" aria-checked={!nonUzs && enabled('local')} aria-disabled={nonUzs || !enabled('local') || undefined}
              style={sx('width:100%;min-height:58px;border:0;background:transparent;cursor:pointer;color:var(--ink);padding:0 16px;display:flex;align-items:center;gap:12px;text-align:start')}>
              <span style={sx('width:40px;height:28px;border-radius:7px;flex:none;background:repeating-linear-gradient(135deg,var(--hover) 0 5px,transparent 5px 10px);box-shadow:var(--inset)')} />
              <span style={sx('flex:1;display:flex;flex-direction:column;gap:1px')}><b style={sx('font-size:15px')}>{p.name || t('manualTile')}</b><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t('phone.localNote')}</span></span>
              <span className={`m-radio${!nonUzs && enabled('local') ? ' is-on' : ''}`} />
            </button>
          ))}
        </div>
        {bannerEl}
        <span style={sx('font-size:12px;color:var(--mut);line-height:1.5')}>{t('phone.nextStep')}</span>
      </main>
      <StickyCta primary={{ label: busy ? t('creating') : free ? t('getCredits') : t('continueMobile', { total }), onClick: () => void pay(), disabled: !canPay, busy }} />
    </>
  );
}
