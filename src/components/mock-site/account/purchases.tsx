'use client';
/** Account → Purchases and receipts (O5 list, O6 receipt download). Modal on desktop, bottom sheet on phones. */
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { downloadReceipt, listOrders } from '@/lib/mock/api/endpoints';
import type { Order } from '@/lib/mock/api/types';
import { fmtDate, fmtMoney } from '@/lib/mock/format';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { PHONE_QUERY, useMedia } from '@/lib/mock/hooks/use-media';
import { sx } from '@/lib/mock/sx';
import { BottomSheet } from '../bottom-sheet';
import { Modal } from '../modal';
import { useToast } from '../toast';

const PILL: Record<Order['status'], string> = { PENDING: 'm-pill--warn', PAID: 'm-pill--ok', FAILED: 'm-pill--warn', CANCELLED: '', REFUNDED: 'm-pill--warn' };

export function Purchases({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('account.account.purch');
  const td = useTranslations('dashboard');
  const toast = useToast();
  const { lang, href } = useLang();
  const isPhone = useMedia(PHONE_QUERY);
  const [items, setItems] = useState<Order[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const load = useCallback(async (cursor?: string) => {
    setErr(false);
    try { const r = await listOrders(cursor); setItems((x) => [...(cursor ? x ?? [] : []), ...r.items]); setNext(r.nextCursor); }
    catch { setErr(true); }
  }, []);
  useEffect(() => { if (open && !items) void load(); }, [open, items, load]);

  const title = (o: Order) => { const p = o.quote.product; return `${p.exam === 'ielts' ? 'IELTS' : 'SAT'} · ${p.kind === 'bundle' ? td('purchase.bundle', { n: p.qty }) : td(`purchase.${p.kind}`)}`; };
  const receipt = (o: Order) => { downloadReceipt(o.id, `${o.receiptNo ?? o.reference}.html`).catch(() => toast(t('receiptErr'))); };

  const body = (
    <div style={sx('display:flex;flex-direction:column;gap:10px;max-height:60vh;overflow:auto')}>
      {err && <div className="m-banner m-banner--err" role="alert" style={sx('align-items:center')}><span style={sx('flex:1')}>{t('loadErr')}</span><button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => void load()}>{t('retry')}</button></div>}
      {!items && !err && [0, 1, 2].map((i) => <div key={i} className="m-skel" style={sx('height:64px;border-radius:16px')} />)}
      {items && items.length === 0 && <span style={sx('font-size:14px;color:var(--ink2)')}>{t('empty')}</span>}
      {items?.map((o) => (
        <div key={o.id} style={sx('padding:14px 16px;border-radius:16px;box-shadow:var(--inset);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center')}>
          <b style={sx('font-size:15px')}>{title(o)}</b>
          <b style={sx('font-size:15px')}><bdi dir="ltr">{fmtMoney(o.quote.total)}</bdi></b>
          <span style={sx('font-size:12px;color:var(--mut);font-weight:700;display:flex;gap:8px;align-items:center;flex-wrap:wrap')}>
            <span className={`m-pill ${PILL[o.status]}`} style={sx('padding:2px 8px;font-size:11px')}>{t(`status.${o.status}`)}</span>
            {fmtDate(lang, o.paidAt ?? o.createdAt)} · <bdi dir="ltr">{o.receiptNo ?? o.reference}</bdi>
          </span>
          <span style={sx('justify-self:end')}>
            {o.status === 'PAID' || o.status === 'REFUNDED'
              ? (o.receiptNo ? <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => receipt(o)}>{t('receipt')}</button> : null)
              : o.status === 'PENDING' ? <Link className="m-btn m-btn--soft m-btn--sm" href={href(`/checkout/orders/${o.id}`)}>{t('open')}</Link> : null}
          </span>
        </div>
      ))}
      {next && <button type="button" className="m-btn m-btn--ghost" onClick={() => void load(next)}>{t('more')}</button>}
    </div>
  );
  if (isPhone) return <BottomSheet open={open} title={t('title')} onClose={onClose}>{body}</BottomSheet>;
  return <Modal open={open} onClose={onClose} label={t('title')} width={560}><span style={sx('font-size:20px;font-weight:800')}>{t('title')}</span>{body}</Modal>;
}
