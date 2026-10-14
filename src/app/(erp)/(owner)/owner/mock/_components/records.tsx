'use client';
/** Read-only record lists reused by order and learner details: lots, ledger, admin actions. */
import type { MockAdminAction, MockLedgerTxn, MockLot } from '@/lib/types/owner-mock';
import { EXAM, KIND, LEDGER_REASON, fmtDate, fmtDateTime } from './format';
import { Muted } from './ui';

const row = 'flex flex-wrap items-center gap-x-4 gap-y-0.5 rounded-[12px] bg-background px-3 py-2 text-[12.5px] shadow-nm-inset-sm';

export function LotsTable({ lots }: { lots: MockLot[] }) {
  if (!lots.length) return <Muted>Kredit partiyalari yo&apos;q.</Muted>;
  return (
    <div className="flex flex-col gap-1.5">
      {lots.map((l) => (
        <div key={l.id} className={row}>
          <span className="font-bold text-foreground">{EXAM[l.exam] ?? l.exam} · {KIND[l.kind] ?? l.kind}</span>
          <span className="text-foreground">{l.remaining} / {l.qty} qoldi</span>
          <span className="text-muted">{LEDGER_REASON[l.source] ?? l.source}</span>
          <span className="ml-auto text-muted">{new Date(l.expiresAt) < new Date() ? "Muddati o'tgan" : 'Amal qiladi'} {fmtDate(l.expiresAt)} gacha</span>
        </div>
      ))}
    </div>
  );
}

export function LedgerTable({ ledger }: { ledger: MockLedgerTxn[] }) {
  if (!ledger.length) return <Muted>Kredit harakatlari yo&apos;q.</Muted>;
  return (
    <div className="flex max-h-[360px] flex-col gap-1.5 overflow-y-auto pr-1">
      {ledger.map((t) => (
        <div key={t.id} className={row}>
          <span className={`w-10 font-extrabold ${t.delta >= 0 ? 'text-success' : 'text-danger'}`}>{t.delta > 0 ? `+${t.delta}` : t.delta}</span>
          <span className="font-bold text-foreground">{EXAM[t.exam] ?? t.exam} · {KIND[t.kind] ?? t.kind}</span>
          <span className="text-muted">{LEDGER_REASON[t.reason] ?? t.reason}</span>
          {t.note ? <span className="text-muted">“{t.note}”</span> : null}
          <span className="ml-auto text-muted">{fmtDateTime(t.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}

const ACTION: Record<string, string> = {
  'order.markPaid': "To'landi deb belgilandi", 'order.markFailed': 'Rad etildi', 'order.refund': 'Qaytarildi',
  'learner.grant': 'Kredit berildi', 'learner.revoke': 'Kredit olindi', 'learner.lock': 'Bloklandi', 'learner.unlock': 'Blokdan chiqarildi',
  'promo.create': 'Promo yaratildi', 'promo.update': "Promo o'zgartirildi", 'ticket.status': "Murojaat holati o'zgardi",
};
export const actionLabel = (a: string) => ACTION[a] ?? (a.startsWith('alert.') ? `Ogohlantirish: ${a.slice(6).replace(/_/g, ' ')}` : a);

function metaText(m: Record<string, unknown> | null) {
  if (!m) return '';
  return Object.entries(m).filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object').map(([k, v]) => `${k}: ${String(v)}`).join(' · ');
}

export function ActionsLog({ actions }: { actions: MockAdminAction[] }) {
  if (!actions.length) return <Muted>Amallar yo&apos;q.</Muted>;
  return (
    <div className="flex flex-col gap-1.5">
      {actions.map((a) => (
        <div key={a.id} className={row}>
          <span className="font-bold text-foreground">{actionLabel(a.action)}</span>
          <span className="min-w-0 break-words text-muted">{metaText(a.meta)}</span>
          <span className="ml-auto text-muted">{fmtDateTime(a.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}
