'use client';
/**
 * Order status — Checkout.dc.html success / failed / pending and Mobile App `payresult`, with the
 * manual PENDING card of design addendum §3.2 (reference, amount, channels, expiry, Check status,
 * Cancel order). O3 polls every 30 s while the tab is visible; credits come only from the server.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MockApiError } from '@/lib/mock/api/client';
import { cancelOrder, downloadReceipt, getOrder } from '@/lib/mock/api/endpoints';
import type { ManualInstructions, Order } from '@/lib/mock/api/types';
import { fmtDate, fmtDateTime, fmtMoney, fmtTime } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useLearner } from '@/lib/mock/hooks/use-learner';
import { PHONE_QUERY, useMedia } from '@/lib/mock/hooks/use-media';
import { sx } from '@/lib/mock/sx';
import { AppBar } from '../app-bar';
import { BottomSheet } from '../bottom-sheet';
import { Modal } from '../modal';
import { StickyCta } from '../sticky-cta';
import { useToast } from '../toast';

const POLL_MS = 30_000;
const group4 = (s: string) => s.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();

export function OrderView({ orderId }: { orderId: string }) {
  const t = useTranslations('checkout');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const { lang, href } = useLang();
  const learner = useLearner();
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState<'notfound' | 'load' | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkErr, setCheckErr] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const refInput = useRef<HTMLSpanElement>(null);
  const isPhone = useMedia(PHONE_QUERY);

  const fetchOrder = useCallback(async (manual = false) => {
    if (manual) { setChecking(true); setCheckErr(false); }
    try {
      const r = await getOrder(orderId);
      const prev = order?.status;
      setOrder(r.order); setErr(null); setLastChecked(new Date());
      if (r.order.status === 'CANCELLED') router.replace(href(`/checkout?sku=${encodeURIComponent(r.order.quote.sku)}&cur=${r.order.quote.currency}&expired=1`));
      else if (manual && r.order.status === 'PENDING' && prev === 'PENDING') toast(t('pending.notYet'));
    } catch (e) {
      if (manual || order) setCheckErr(true);
      else setErr(e instanceof MockApiError && e.status === 404 ? 'notfound' : 'load');
    } finally { if (manual) setChecking(false); }
  }, [orderId, order, router, href, toast, t]);

  useEffect(() => {
    if (learner) void fetchOrder();
    // first load only; later checks come from the poller and "Check status"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learner, orderId]);
  // auto-check while pending and visible; one check when the tab comes back
  useEffect(() => {
    if (order?.status !== 'PENDING') return;
    const tick = () => { if (document.visibilityState === 'visible') void fetchOrder(); };
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, [order?.status, fetchOrder]);

  const slow = useDelayedFlag(!order && !err);

  const copy = async (text: string, okMsg: string) => {
    try { await navigator.clipboard.writeText(text); toast(okMsg); }
    catch {
      const sel = window.getSelection(); const r = document.createRange();
      if (refInput.current) { r.selectNodeContents(refInput.current); sel?.removeAllRanges(); sel?.addRange(r); }
      toast(t('pending.copyManual'));
    }
  };
  const doCancel = async () => {
    setCancelling(true);
    try { await cancelOrder(orderId); toast(t('pending.cancelled')); router.replace(href(`/checkout?sku=${encodeURIComponent(order!.quote.sku)}&cur=${order!.quote.currency}`)); }
    catch { setCancelling(false); setConfirmCancel(false); setCheckErr(true); }
  };

  if (err) {
    return (
      <main style={sx('max-width:560px;margin:6vh auto;padding:0 16px')}>
        <div className={`m-banner ${err === 'notfound' ? 'm-banner--warn' : 'm-banner--err'}`} role="alert" style={sx('align-items:center')}>
          <span style={sx('flex:1')}>{err === 'notfound' ? t('notFound') : t('loadError')}</span>
          {err === 'load' && <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => void fetchOrder()}>{t('tryAgain')}</button>}
        </div>
      </main>
    );
  }
  if (!order) {
    return (
      <main style={sx('max-width:520px;margin:6vh auto;padding:0 16px')} aria-busy="true">
        {slow && <div className="m-card" style={sx('padding:32px;display:flex;flex-direction:column;gap:14px')}><div className="m-skel" style={sx('height:24px;width:90px;border-radius:999px')} /><div className="m-skel" style={sx('height:28px;width:80%')} /><div className="m-skel" style={sx('height:16px;width:95%')} /><div className="m-skel" style={sx('height:110px;border-radius:16px')} /></div>}
      </main>
    );
  }

  const q = order.quote;
  const planName = q.product.kind === 'bundle' ? t('plan.bundle', { n: q.product.qty }) : t(`plan.${q.product.kind}`);
  const examTag = q.product.exam === 'ielts' ? 'IELTS ACADEMIC' : 'DIGITAL SAT';
  const manual: ManualInstructions | null = order.next?.kind === 'manual' ? order.next.instructions : null;
  const reference = manual?.reference ?? '';
  const amount = manual?.amount ?? q.total;
  const creditLine = order.granted
    ? order.granted.unlimitedDays ? t('success.unlimited', { n: order.granted.unlimitedDays })
      : order.granted.fullMocks ? t('success.credits', { n: order.granted.fullMocks })
      : t('success.sections', { n: order.granted.sections })
    : '';
  const receipt = async () => { try { await downloadReceipt(order.id, `${order.receiptNo ?? order.id}.html`); } catch { toast(t('pending.checkErr')); } };

  /* ---------- pieces ---------- */
  const chip = (kind: 'ok' | 'err' | 'warn', text: string) => <span className={`m-pill m-pill--${kind}`} style={sx('align-self:flex-start;padding:5px 12px')}>{text}</span>;
  const channelRow = (c: ManualInstructions['channels'][number], i: number) => {
    const handle = c.value.startsWith('@') ? c.value : `@${c.value.replace(/^https?:\/\/t\.me\//, '')}`;
    return (
      <div key={i} style={sx('padding:14px 16px;display:flex;align-items:center;gap:12px')}>
        <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}>
          <b style={sx('font-size:14px')}>{c.type === 'card_transfer' ? t('pending.chCard') : c.type === 'click_invoice' ? t('pending.chClick') : t('pending.chTg')}</b>
          <span style={sx('font-size:13px;color:var(--ink2);font-weight:600;overflow-wrap:anywhere')}>
            {c.type === 'card_transfer' ? <><bdi dir="ltr">{group4(c.value)}</bdi>{c.holder ? ` · ${c.holder}` : ''}</> : c.type === 'click_invoice' ? t('pending.chClickNote') : t('pending.chTgNote', { handle })}
          </span>
        </span>
        {c.type === 'card_transfer'
          ? <button type="button" className="m-btn m-btn--soft" style={sx('height:36px;padding:0 12px;border-radius:11px;font-size:13px')} onClick={() => void copy(c.value.replace(/\s+/g, ''), t('pending.copiedCard'))}>{t('pending.copy')}</button>
          : <a className="m-btn m-btn--ghost" style={sx('height:36px;padding:0 8px;font-size:13px')} href={c.type === 'telegram' ? `https://t.me/${handle.slice(1)}` : c.value} target="_blank" rel="noopener noreferrer">{t('pending.open')} ↗</a>}
      </div>
    );
  };
  const refPanel = (big: number) => (
    <div style={sx('border-radius:16px;box-shadow:var(--inset);padding:16px;display:flex;flex-direction:column;gap:10px;text-align:start')}>
      <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
        <span className="m-eyebrow" style={sx('color:var(--mut)')}>{t('pending.reference')}</span>
        <button type="button" className="m-btn m-btn--soft" style={sx('height:36px;padding:0 12px;border-radius:11px;font-size:13px')} onClick={() => void copy(reference, t('pending.copiedRef'))}>{t('pending.copy')}</button>
      </div>
      <span ref={refInput} style={{ ...sx('font-weight:800;user-select:all;letter-spacing:.02em'), fontSize: big }}><bdi dir="ltr">{reference}</bdi></span>
      <div style={sx('height:1px;background:var(--line)')} />
      <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
        <span style={sx('display:flex;flex-direction:column;gap:2px')}><span style={sx('font-size:14px;color:var(--ink2);font-weight:600')}>{t('pending.amount')}</span><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t('pending.exact')}</span></span>
        <span style={sx('display:flex;align-items:center;gap:10px')}><b style={sx('font-size:16px')}><bdi dir="ltr">{fmtMoney(amount)}</bdi></b>
          <button type="button" className="m-btn m-btn--soft" style={sx('height:36px;padding:0 12px;border-radius:11px;font-size:13px')} onClick={() => void copy(String(amount.currency === 'UZS' ? amount.amountMinor : (amount.amountMinor / 100).toFixed(2)), t('pending.copiedAmount'))}>{t('pending.copy')}</button></span>
      </div>
    </div>
  );
  const receiptBox = (
    <div style={sx('border-radius:24px;box-shadow:var(--inset);padding:24px;display:flex;flex-direction:column;gap:10px;font-size:14px;text-align:start;width:100%')}>
      <div style={sx('display:flex;justify-content:space-between;gap:8px;font-weight:800')}><span>{t.rich('success.receipt', { no: () => <bdi dir="ltr">{order.receiptNo}</bdi> })}</span><button type="button" onClick={() => void receipt()} style={sx('border:0;background:transparent;color:var(--blue);font-weight:700;font-size:13px;cursor:pointer;padding:0')}>{t('success.download')}</button></div>
      <div style={sx('display:flex;justify-content:space-between;color:var(--ink2)')}><span>{order.paidAt ? fmtDate(lang, order.paidAt) : ''} · {reference ? t.rich('success.methodTransfer', { ref: () => <bdi dir="ltr">{reference}</bdi> }) : t('success.methodTransferNoRef')}</span></div>
      <div style={sx('display:flex;justify-content:space-between;gap:8px')}><span>{examTag} · {planName}</span><span style={sx('font-weight:700;white-space:nowrap')}><bdi dir="ltr">{fmtMoney(q.subtotal)}</bdi></span></div>
      {q.promo && q.discount.amountMinor > 0 && <div style={sx('display:flex;justify-content:space-between;color:var(--ok)')}><span>{q.promo.code}</span><span><bdi dir="ltr">−{fmtMoney(q.discount)}</bdi></span></div>}
      <div style={sx('display:flex;justify-content:space-between;color:var(--ink2)')}><span>{t('taxes')}</span><span>{t('included')}</span></div>
      <div style={sx('display:flex;justify-content:space-between;font-weight:800;padding-top:8px;border-top:1px solid var(--line)')}><span>{t('success.paid')}</span><span><bdi dir="ltr">{fmtMoney(q.total)}</bdi></span></div>
    </div>
  );
  const startHref = href(`/start/${q.product.exam}?mode=${q.product.kind === 'section' ? 'section' : 'full'}`);
  const isManualFail = order.status === 'FAILED' && order.provider === 'manual';

  /* ---------- desktop ---------- */
  const desktop = (() => {
    if (order.status === 'PAID') return (
      <div style={sx('max-width:560px;margin:4vh auto;display:flex;flex-direction:column;gap:20px')}>
        <div className="m-card" style={sx('padding:32px;display:flex;flex-direction:column;gap:14px')}>
          {chip('ok', t('success.chip'))}
          <span style={sx('font-size:28px;font-weight:800;letter-spacing:var(--ls-t)')}>{creditLine}</span>
          <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t.rich('success.receiptTo', { email: () => <bdi dir="ltr">{learner?.email ?? ''}</bdi> })}</span>
          <div style={sx('display:flex;gap:10px;flex-wrap:wrap;margin-top:6px')}>
            <a className="m-btn m-btn--primary" href={startHref} style={sx('flex:1;min-width:180px;height:52px;font-size:16px')}>{t('success.start')}</a>
            <a className="m-btn m-btn--soft" href={href('/dashboard')} style={sx('flex:1;min-width:160px;height:52px;font-size:16px')}>{t('success.dashboard')}</a>
          </div>
        </div>
        {receiptBox}
      </div>
    );
    if (order.status === 'FAILED' || order.status === 'REFUNDED') return (
      <div className="m-card" style={sx('max-width:520px;margin:6vh auto;padding:32px;display:flex;flex-direction:column;gap:14px')}>
        {chip('err', t('failed.chip'))}
        <span style={sx('font-size:26px;font-weight:800')}>{isManualFail ? t('failed.manualTitle') : t('failed.title')}</span>
        <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{isManualFail ? t.rich('failed.manualBody', { ref: () => <bdi dir="ltr">{reference}</bdi> }) : t('failed.body')}</span>
        <a className="m-btn m-btn--primary" href={href(`/checkout?sku=${encodeURIComponent(q.sku)}&cur=${q.currency}`)} style={sx('height:52px;font-size:16px')}>{t('failed.retry')}</a>
        <a href={href('/help/contact')} style={sx('text-align:center;font-weight:700;font-size:14px')}>{t('failed.contact')}</a>
      </div>
    );
    // PENDING (manual)
    return (
      <div className="m-card" style={sx('max-width:520px;margin:6vh auto;padding:32px;display:flex;flex-direction:column;gap:14px')}>
        {chip('warn', t('pending.chip'))}
        <span style={sx('font-size:26px;font-weight:800;line-height:1.25')}>{t.rich('pending.title', { total: () => <bdi dir="ltr">{fmtMoney(amount)}</bdi> })}</span>
        <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t('pending.body', { min: manual?.expectedWithinMin ?? 15 })}</span>
        {manual && refPanel(28)}
        {manual && manual.channels.length > 0 && <><b style={sx('font-size:15px')}>{t('pending.howTo')}</b><div className="m-rows">{manual.channels.map(channelRow)}</div></>}
        <span style={sx('font-size:13px;color:var(--mut)')}>{t('pending.expires', { datetime: fmtDateTime(lang, order.expiresAt) })}</span>
        <button type="button" className="m-btn m-btn--soft" disabled={checking} onClick={() => void fetchOrder(true)} style={sx('height:52px;font-size:15px;font-weight:800')}>{checking && <span className="m-spin m-spin--ink" aria-hidden />}{t('pending.check')}</button>
        {checkErr && <span className="m-err-text" role="alert">{t('pending.checkErr')}</span>}
        <span style={sx('font-size:12px;color:var(--mut);display:flex;gap:8px;flex-wrap:wrap;align-items:center')}>
          {lastChecked && t('pending.lastChecked', { time: fmtTime(lang, lastChecked) })}{lastChecked && ' ·'}
          <button type="button" className="m-link-mut" onClick={() => setConfirmCancel(true)} style={sx('border:0;background:transparent;font-size:12px;cursor:pointer;padding:0;color:var(--mut)')}>{t('pending.cancel')}</button>
        </span>
      </div>
    );
  })();

  /* ---------- phone (Mobile App `payresult`) ---------- */
  const tone = order.status === 'PAID' ? { bg: 'var(--okBg)', fg: 'var(--ok)', w: '22px', h: '40px', rot: '45deg', tag: t('success.chip') }
    : order.status === 'PENDING' ? { bg: 'var(--warnBg)', fg: 'var(--warn)', w: '0px', h: '30px', rot: '0deg', tag: t('pending.chip') }
    : { bg: 'var(--errBg)', fg: 'var(--err)', w: '0px', h: '36px', rot: '0deg', tag: t('failed.chip') };
  const phone = (
    <div style={sx('padding:48px 24px 24px;display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center')}>
      <span style={{ ...sx('width:88px;height:88px;border-radius:50%;display:grid;place-items:center'), background: tone.bg }} aria-hidden>
        <span style={{ ...sx('margin-top:-8px;border-radius:2px'), width: tone.w, height: tone.h, borderBottom: `5px solid ${tone.fg}`, borderInlineEnd: `5px solid ${tone.fg}`, transform: `rotate(${tone.rot})` }} />
      </span>
      <span className="m-pill" style={{ ...sx('padding:5px 12px'), background: tone.bg, color: tone.fg }}>{tone.tag}</span>
      <h1 style={sx('margin:0;font-size:26px;font-weight:800;letter-spacing:var(--ls-t);line-height:1.2')}>
        {order.status === 'PAID' ? creditLine : order.status === 'PENDING' ? t.rich('pending.title', { total: () => <bdi dir="ltr">{fmtMoney(amount)}</bdi> }) : isManualFail ? t('failed.manualTitle') : t('failed.title')}
      </h1>
      <span style={{ ...sx('color:var(--ink2);font-size:15px;line-height:1.6'), textAlign: order.status === 'PENDING' ? 'start' : 'center' }}>
        {order.status === 'PAID' ? t.rich('success.receiptTo', { email: () => <bdi dir="ltr">{learner?.email ?? ''}</bdi> })
          : order.status === 'PENDING' ? t('pending.body', { min: manual?.expectedWithinMin ?? 15 })
          : isManualFail ? t.rich('failed.manualBody', { ref: () => <bdi dir="ltr">{reference}</bdi> }) : t('failed.body')}
      </span>
      {order.status === 'PAID' && receiptBox}
      {order.status === 'PENDING' && manual && (
        <div style={sx('width:100%;display:flex;flex-direction:column;gap:14px;text-align:start')}>
          {refPanel(24)}
          {manual.channels.length > 0 && <><b style={sx('font-size:15px')}>{t('pending.howTo')}</b><div className="m-rows">{manual.channels.map(channelRow)}</div></>}
          <span style={sx('font-size:13px;color:var(--mut)')}>{t('pending.expires', { datetime: fmtDateTime(lang, order.expiresAt) })}</span>
          {checkErr && <span className="m-err-text" role="alert">{t('pending.checkErr')}</span>}
          <button type="button" className="m-btn m-btn--ghost" onClick={() => setConfirmCancel(true)} style={sx('align-self:flex-start;padding:0;height:36px;color:var(--mut);font-size:14px')}>{t('pending.cancel')}</button>
        </div>
      )}
    </div>
  );
  const phoneCta = order.status === 'PAID'
    ? { primary: { label: t('success.startShort'), href: startHref }, secondary: { label: t('success.home'), href: href('/dashboard') } }
    : order.status === 'PENDING'
      ? { primary: { label: t('pending.check'), onClick: () => void fetchOrder(true), busy: checking } }
      : { primary: { label: t('failed.retry'), href: href(`/checkout?sku=${encodeURIComponent(q.sku)}&cur=${q.currency}`) } };

  const cancelBody = (
    <>
      <span style={sx('font-size:15px;line-height:1.6;color:var(--ink2)')}>{t('pending.cancelBody')}</span>
    </>
  );

  return (
    <>
      <AppBar left="none" />
      <main className="m-desk" style={sx('padding:clamp(20px,4vw,48px) 20px 64px')}>{desktop}</main>
      <main className="m-phone m-with-cta-phone">{phone}</main>
      <StickyCta {...phoneCta} />
      {/* desktop: modal; phone: bottom sheet (Delete-account sheet style) */}
      {!isPhone && (
        <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} label={t('pending.cancelTitle')} width={400}>
          <span style={sx('font-size:20px;font-weight:800')}>{t('pending.cancelTitle')}</span>
          {cancelBody}
          <div style={sx('display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap')}>
            <button type="button" data-autofocus className="m-btn m-btn--soft" onClick={() => setConfirmCancel(false)} style={sx('height:44px;padding:0 16px;border-radius:13px;font-size:15px')}>{t('pending.keep')}</button>
            <button type="button" className="m-btn m-btn--ghost" disabled={cancelling} onClick={() => void doCancel()} style={sx('height:44px;color:var(--ink);font-size:15px')}>{cancelling && <span className="m-spin m-spin--ink" aria-hidden />}{t('pending.cancel')}</button>
          </div>
        </Modal>
      )}
      {isPhone && (
        <BottomSheet open={confirmCancel} title={t('pending.cancelTitle')} onClose={() => setConfirmCancel(false)} doneLabel={tc('sheet.done')}>
          {cancelBody}
          <button type="button" className="m-btn m-btn--soft" onClick={() => setConfirmCancel(false)} style={sx('height:52px;border-radius:16px;font-size:15px;font-weight:800')}>{t('pending.keep')}</button>
          <button type="button" disabled={cancelling} onClick={() => void doCancel()} style={sx('height:52px;border-radius:16px;border:0;background:var(--ink);color:var(--bg);font-weight:800;font-size:15px;cursor:pointer')}>{t('pending.cancel')}</button>
        </BottomSheet>
      )}
    </>
  );
}
