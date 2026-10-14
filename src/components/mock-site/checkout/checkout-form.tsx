'use client';
/**
 * Checkout form — Checkout.dc.html `form` (≥520) and Mobile App `checkout` (<520).
 * Methods come from O8 (contract v0.3): Card / Wallet = Paddle (USD/EUR) — the card number is typed
 * in Paddle's overlay, never here; Local = manual transfer (UZS). A group the server has not
 * configured keeps the "Soon" pill; a group that only needs another currency offers the switch.
 * Quote = O1, order = O2; a Paddle order opens the overlay on this page and, once Paddle reports
 * `checkout.completed`, hands over to the order page, which polls O3 (credits come only from the webhook).
 */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MockApiError } from '@/lib/mock/api/client';
import { cancelOrder, createOrder, getMethods, getOrder, getQuote, resendVerification } from '@/lib/mock/api/endpoints';
import type { CheckoutMethods, Currency, MethodReason, Order, PaymentMethodGroup, Quote } from '@/lib/mock/api/types';
import { fmtMoney } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useLearner } from '@/lib/mock/hooks/use-learner';
import { usePaddle } from '@/lib/mock/hooks/use-paddle';
import { sx } from '@/lib/mock/sx';
import { AppBar } from '../app-bar';
import { Segmented } from '../segmented';
import { StickyCta } from '../sticky-cta';
import { useToast } from '../toast';
import { PayIcon } from './pay-icons';

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
type Banner = { kind: 'warn' | 'err' | 'info'; text: React.ReactNode } | null;

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
  const { lang, href } = useLang();
  const learner = useLearner();
  const [sku, setSku] = useState<string | null>(null);
  const [cur, setCur] = useState<Currency>('UZS');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteErr, setQuoteErr] = useState(false);
  const [methods, setMethods] = useState<CheckoutMethods | null>(null);
  const [methodsErr, setMethodsErr] = useState(false);
  const [group, setGroup] = useState<PaymentMethodGroup>('local');
  const [soonNote, setSoonNote] = useState(false);
  const [phoneWallet, setPhoneWallet] = useState<'wallet' | 'wallet2'>('wallet');
  const [promo, setPromo] = useState('');
  const [promoErr, setPromoErr] = useState(false);
  const [applied, setApplied] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [expired, setExpired] = useState(false);
  const idem = useRef(uuid());
  const soonTimer = useRef<number>();
  /** open Paddle order of this page + what it was created for (reused while sku/currency/promo stay the same) */
  const paddleOrder = useRef<{ order: Order; key: string } | null>(null);
  const orderUrl = (id: string, paid = false) => href(`/checkout/orders/${encodeURIComponent(id)}${paid ? '?paid=1' : ''}`);
  const paddle = usePaddle({
    locale: lang,
    email: learner?.email,
    onCompleted: () => { const o = paddleOrder.current?.order; if (o) router.push(orderUrl(o.id, true)); },
    onClosed: () => {
      const o = paddleOrder.current?.order;
      if (!o) return;
      // closed without "completed": the payment may still have gone through (or been declined)
      getOrder(o.id).then((r) => {
        if (r.order.status === 'PAID') { router.push(orderUrl(o.id)); return; }
        if (r.order.status !== 'PENDING') { paddleOrder.current = null; idem.current = uuid(); }
        setBanner(r.order.status === 'FAILED' && r.order.failureCode === 'DECLINED' ? { kind: 'err', text: t('paddle.declined') } : { kind: 'info', text: t('paddle.closed') });
      }).catch(() => setBanner({ kind: 'info', text: t('paddle.closed') }));
    },
  });
  useEffect(() => { if (paddle.state === 'error') setBanner({ kind: 'err', text: t('paddle.loadErr') }); }, [paddle.state, t]);

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
      setGroup((g) => (m.methods.find((x) => x.group === g)?.enabled ? g : first?.group ?? (cur === 'UZS' ? 'local' : 'card')));
    }).catch(() => setMethodsErr(true));
  }, [learner, cur]);

  const slow = useDelayedFlag(!quote && !quoteErr);
  const enabled = (g: PaymentMethodGroup) => !!methods?.methods.find((m) => m.group === g && m.enabled);
  const reason = (g: PaymentMethodGroup): MethodReason => methods?.methods.find((m) => m.group === g)?.reason ?? null;
  /** not offered at all yet (server not configured) → "Soon"; offered in another currency → switch */
  const soon = (g: PaymentMethodGroup) => !!methods && !enabled(g) && reason(g) !== 'CURRENCY_NOT_SUPPORTED';
  const paddleOn = enabled('card') || enabled('wallet');
  const paddleGroup = group === 'card' || group === 'wallet';
  const localProviders = methods?.methods.find((m) => m.group === 'local')?.providers ?? [];
  const anyEnabled = !!methods?.methods.some((m) => m.enabled);
  const nonUzs = cur !== 'UZS';
  const total = quote ? fmtMoney(quote.total) : '';
  const free = !!quote && quote.total.amountMinor === 0;
  const paying = busy || paddle.state === 'opening' || paddle.state === 'open';
  const canPay = !!quote && !paying && (free || enabled(group));

  const pickGroup = (g: PaymentMethodGroup) => {
    if (soon(g) && g !== 'local') {
      setSoonNote(true);
      window.clearTimeout(soonTimer.current);
      soonTimer.current = window.setTimeout(() => setSoonNote(false), 4000);
      return;
    }
    setGroup(g);
  };

  const pay = async () => {
    if (!sku || !canPay) return;
    setBanner(null);
    const key = `${sku}|${cur}|${applied ?? ''}|${group}`;
    const prev = paddleOrder.current;
    if (prev && !free && paddleGroup) {
      // same order still open at Paddle → reopen its overlay instead of creating another order
      if (prev.key === key && prev.order.next?.kind === 'paddle_overlay') { void paddle.open(prev.order.next.clientToken, prev.order.next.transactionId); return; }
      void cancelOrder(prev.order.id).catch(() => undefined); // plan/currency/promo changed: free the pending slot
      paddleOrder.current = null;
      idem.current = uuid();
    }
    setBusy(true);
    try {
      const r = await createOrder({ sku, currency: cur, promoCode: applied, methodGroup: free ? 'local' : group, idempotencyKey: idem.current });
      const next = r.order.next;
      if (next?.kind === 'paddle_overlay' && r.order.status === 'PENDING') {
        paddleOrder.current = { order: r.order, key };
        setBusy(false);
        void paddle.open(next.clientToken, next.transactionId);
        return;
      }
      router.push(orderUrl(r.order.id));
    } catch (e) {
      setBusy(false);
      idem.current = uuid();
      if (!(e instanceof MockApiError)) { setBanner({ kind: 'err', text: t('serverErr') }); return; }
      if (e.code === 'PROVIDER_ERROR' && typeof e.body.orderId === 'string') { router.push(orderUrl(e.body.orderId)); return; }
      switch (e.code) {
        case 'TOO_MANY_PENDING_ORDERS': setBanner({ kind: 'warn', text: <>{t('tooMany')} <Link href={href('/dashboard')} style={sx('font-weight:800')}>{t('seeOrders')}</Link></> }); break;
        case 'EMAIL_NOT_VERIFIED': setBanner({ kind: 'warn', text: <VerifyFirst /> }); break;
        case 'PROMO_INVALID': setPromoErr(true); setApplied(undefined); break;
        case 'PRODUCT_UNAVAILABLE': router.replace(href('/pricing?model=unl')); break;
        case 'METHOD_NOT_AVAILABLE':
          setBanner({ kind: 'warn', text: e.body.reason === 'CURRENCY_NOT_SUPPORTED' ? (paddleGroup ? t('paddle.usdOnly') : t('paddle.uzsOnly')) : paddleGroup ? t('paddle.notAvailable') : t('methodsErr') });
          getMethods(cur).then(setMethods).catch(() => undefined);
          break;
        case 'RATE_LIMITED': setBanner({ kind: 'warn', text: tc('errors.rateLimited', { sec: e.retryAfterSec ?? 60 }) }); break;
        default: setBanner({ kind: 'err', text: <>{t('serverErr')}</> });
      }
    }
  };

  const product = quote?.product;
  const examTag = product ? (product.exam === 'ielts' ? 'IELTS ACADEMIC' : 'DIGITAL SAT') : '';
  const planName = product ? (product.kind === 'bundle' ? t('plan.bundle', { n: product.qty }) : t(`plan.${product.kind}`)) : '';
  const planNote = product ? (product.kind === 'bundle' ? t('planNote.bundle', { n: product.qty, months: product.validityMonths ?? 12 }) : t(`planNote.${product.kind}`, { months: product.validityMonths ?? 12 })) : '';
  const ctaLabel = busy ? t('creating') : paddle.state === 'opening' ? t('paddle.opening') : free ? t('getCredits')
    : !enabled(group) ? t('continueNoTotal') : paddleGroup ? t('paddle.pay', { total }) : t('continue', { total });

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
  const bannerEl = banner && <div className={`m-banner m-banner--${banner.kind}`} role={banner.kind === 'info' ? 'status' : 'alert'}>{banner.text}</div>;
  const expiredEl = expired && <div className="m-banner m-banner--warn" role="status">{t('expiredBanner')}</div>;
  const quoteErrEl = quoteErr && <div className="m-banner m-banner--err" role="alert" style={sx('align-items:center')}><span style={sx('flex:1')}>{t('serverErr')}</span><button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => void loadQuote(applied)}>{t('tryAgain')}</button></div>;
  const switchBanner = (text: string, to: Currency, label: string) => (
    <div className="m-banner m-banner--warn" role="status" style={sx('align-items:center;flex-wrap:wrap')}>
      <span style={sx('flex:1;min-width:200px')}>{text}</span>
      <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => setCur(to)}>{label}</button>
    </div>
  );
  // USD/EUR without Paddle: the MVP banner; with Paddle: only Local needs UZS; UZS + card/wallet: needs USD
  const currencyBanner = !methods ? null
    : nonUzs && !paddleOn ? switchBanner(t('currencySoon'), 'UZS', t('switchUzs'))
    : nonUzs && group === 'local' ? switchBanner(t('paddle.uzsOnly'), 'UZS', t('switchUzs'))
    : !nonUzs && paddleGroup && reason(group) === 'CURRENCY_NOT_SUPPORTED' ? switchBanner(t('paddle.usdOnly'), 'USD', t('paddle.switchUsd'))
    : null;
  const paddleNote = paddleGroup && enabled(group) && (
    <div style={sx('padding:12px 14px;border-radius:14px;box-shadow:var(--inset);font-size:13px;line-height:1.55;color:var(--ink2)')}>{group === 'card' ? t('paddle.cardNote') : t('paddle.walletNote')}</div>
  );
  const methodsState = methodsErr ? <div className="m-banner m-banner--err" role="alert">{t('methodsErr')}</div>
    : methods && !anyEnabled ? <div className="m-banner m-banner--warn">{t('methodsEmpty')} <Link href={href('/help/contact')}>{tc('footer.contact')}</Link></div> : null;
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
                  items={(['card', 'wallet', 'local'] as const).map((g) => ({ key: g, label: t(g), pill: soon(g) && g !== 'local' ? soonPill : undefined, disabled: !enabled(g) }))} />
              )}
              {soonNote && <div role="status" style={sx('padding:10px 14px;border-radius:12px;background:var(--hover);font-size:13px;font-weight:600;color:var(--ink2)')}>{t('cardSoonNote')}</div>}
              {methodsState}
              {currencyBanner}
              {paddleNote}
              {group === 'local' && enabled('local') && (
                <>
                  <div style={sx('display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px')}>
                    {(localProviders.length ? localProviders : [{ code: 'manual', name: '' }]).map((p) => (
                      <button key={p.code} type="button" role="radio" aria-checked="true" className="m-radiocard" style={sx('height:72px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px')}>
                        <PayIcon kind="local" tile={false} />
                        <span style={sx('font-size:12px;font-weight:700')}>{p.name || t('manualTile')}</span>
                      </button>
                    ))}
                  </div>
                  <div style={sx('font-size:12px;color:var(--mut);line-height:1.5')}>{t('manualNote')}</div>
                </>
              )}
              {bannerEl}
              <button type="button" className="m-btn m-btn--primary" disabled={!canPay} onClick={() => void pay()} style={sx('height:54px;font-weight:800;font-size:16px')}>{(busy || paddle.state === 'opening') && <span className="m-spin" aria-hidden />}{ctaLabel}</button>
              {paddleGroup && enabled(group) && <div style={sx('font-size:12px;color:var(--mut);line-height:1.5')}>{t('secure')}</div>}
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
            <Link href={href(`/pricing${product ? `?exam=${product.exam}` : ''}`)} style={sx('font-size:13px;font-weight:700')}>{t('changePlan')}</Link>
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
          {([['card', t('card'), t('phone.cardNote')], ['wallet', t('phone.applePay'), ''], ['wallet2', t('phone.googlePay'), '']] as const).map(([k, name, note]) => {
            const g: PaymentMethodGroup = k === 'card' ? 'card' : 'wallet';
            const on = enabled(g);
            const checked = on && (k === 'card' ? group === 'card' : group === 'wallet' && phoneWallet === k);
            return (
              <button key={k} type="button" role="radio" aria-checked={checked} aria-disabled={!on || undefined}
                onClick={() => { if (on) { setGroup(g); if (g === 'wallet') setPhoneWallet(k as 'wallet' | 'wallet2'); } else toast(soon(g) ? t('cardSoonToast') : t('paddle.usdOnly')); }}
                style={sx('width:100%;min-height:58px;border:0;background:transparent;cursor:pointer;color:var(--ink);padding:0 16px;display:flex;align-items:center;gap:12px;text-align:start')}>
                <PayIcon kind={g} dim={!on} />
                <span style={{ ...sx('flex:1;display:flex;flex-direction:column;gap:1px'), opacity: on ? 1 : 0.55 }}><b style={sx('font-size:15px')}>{name}</b>{note && <span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{note}</span>}</span>
                {soon(g) ? soonPill : on ? <span className={`m-radio${checked ? ' is-on' : ''}`} /> : <span style={sx('font-size:12px;font-weight:700;color:var(--mut)')}>USD · EUR</span>}
              </button>
            );
          })}
          {(localProviders.length ? localProviders : [{ code: 'manual', name: '' }]).map((p) => (
            <button key={p.code} type="button" role="radio" aria-checked={group === 'local' && enabled('local')} aria-disabled={!enabled('local') || undefined}
              onClick={() => { if (enabled('local')) setGroup('local'); else if (reason('local') === 'CURRENCY_NOT_SUPPORTED') toast(t('paddle.uzsOnly')); }}
              style={sx('width:100%;min-height:58px;border:0;background:transparent;cursor:pointer;color:var(--ink);padding:0 16px;display:flex;align-items:center;gap:12px;text-align:start')}>
              <PayIcon kind="local" dim={!enabled('local')} />
              <span style={{ ...sx('flex:1;display:flex;flex-direction:column;gap:1px'), opacity: enabled('local') ? 1 : 0.55 }}><b style={sx('font-size:15px')}>{p.name || t('manualTile')}</b><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t('phone.localNote')}</span></span>
              <span className={`m-radio${group === 'local' && enabled('local') ? ' is-on' : ''}`} />
            </button>
          ))}
        </div>
        {paddleNote}
        {bannerEl}
        {group === 'local' && <span style={sx('font-size:12px;color:var(--mut);line-height:1.5')}>{t('phone.nextStep')}</span>}
      </main>
      <StickyCta primary={{ label: busy ? t('creating') : paddle.state === 'opening' ? t('paddle.opening') : free ? t('getCredits') : paddleGroup && enabled(group) ? t('paddle.phoneCta', { total }) : t('continueMobile', { total }), onClick: () => void pay(), disabled: !canPay, busy: busy || paddle.state === 'opening' }} />
    </>
  );
}
