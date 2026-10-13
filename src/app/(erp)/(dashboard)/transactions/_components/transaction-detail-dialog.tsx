'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { Can } from '@/components/shared/can';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useWithdrawEntry } from '@/lib/hooks/use-transactions';
import { formatDateTime } from '@/lib/utils/date';
import { personName, SYS_CATEGORY } from '@/lib/utils/tx-display';
import type { Transaction } from '@/lib/types/transaction';
import { CorrectDialog } from './correct-dialog';
import { EntryPreview } from './entry-preview';
import { RefundDialog } from './refund-dialog';
import { rowLook } from './row-look';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[13px]">
      <span className="shrink-0 font-medium text-muted">{label}</span>
      <span className="text-right font-bold text-foreground">{children}</span>
    </div>
  );
}

function statusLine(tx: Transaction): string {
  if (tx.status === 'PENDING') return 'Tasdiq kutilmoqda';
  if (tx.status === 'RETURNED') return 'Aniqlik kutilmoqda';
  if (tx.status === 'WITHDRAWN') return 'Qaytarib olindi';
  if (tx.voided) {
    const word = tx.studentId ? 'Qaytarilgan' : "To'g'rilangan";
    // `related.date` is when the correction happened — the server resolves the
    // pair now, so this no longer depends on both halves being on this page.
    return `${word} · ${formatDateTime(tx.related?.date ?? tx.date)}`;
  }
  // Only the fact and the time — who approved it is in the audit log, not on
  // the cashier's screen (§C.4: an entry is an event, not a relationship).
  if (tx.approvedAt) return `Tasdiqlangan · ${formatDateTime(tx.approvedAt)}`;
  return `Yozildi · ${formatDateTime(tx.createdAt)}`;
}

interface DetailDialogProps {
  tx: Transaction;
  onOpenChange: (open: boolean) => void;
  /** Rows on the current page — used to resolve the linked correction row. */
  rows: Transaction[];
  onSelect: (tx: Transaction) => void;
  /**
   * Reopen the entry dialog — `edit` patches this very row (§C.2), `copy`
   * starts a fresh entry from its values after a correction (§F.3).
   */
  onEdit: (tx: Transaction, mode: 'edit' | 'copy') => void;
}

/**
 * §A.7 — one entry, opened.
 *
 * This is where `#seq` lives: the daily list shows a running number instead,
 * because a 60-second undo leaves a real gap in the sequence and a gap reads
 * as the system hiding something [SV5]. The phone number behind `createdBy` is
 * dropped — it answers no question this screen raises.
 */
export function TransactionDetailDialog({ tx, onOpenChange, rows, onSelect, onEdit }: DetailDialogProps) {
  const [correcting, setCorrecting] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const withdraw = useWithdrawEntry();

  const look = rowLook(tx);
  // `tx.related` names the counterpart (#seq + date) whether or not it is on
  // this page; `pair` is the full row, found only when it happens to be, and
  // it is what the reason / author lines and the jump need.
  const pair = tx.reversalOf
    ? rows.find((r) => r.id === tx.reversalOf)
    : rows.find((r) => r.reversalOf === tx.id);
  const isCorrection = !!tx.reversalOf;
  const frozen = isCorrection || tx.voided || tx.status === 'WITHDRAWN' || look.category === SYS_CATEGORY.DAY_DIFF;

  return (
    <NmDialog open onOpenChange={onOpenChange} title={`Yozuv #${tx.seq}`}>
      <div className="flex flex-col gap-5">
        <EntryPreview tx={tx} />

        <div className="flex flex-col gap-2.5">
          <Row label="Kontragent">{tx.party || '—'}</Row>
          <Row label="Izoh">{tx.note || '—'}</Row>
          <Row label="Kim yozdi">{personName(tx.createdBy)}</Row>
          <Row label="Holat">{statusLine(tx)}</Row>
          {tx.status === 'RETURNED' && (tx.returnReason || tx.returnNote) ? (
            <Row label="Sabab">{tx.returnNote || tx.returnReason}</Row>
          ) : null}
          {tx.voided && pair?.correctReason ? <Row label="Sabab">{pair.correctReason}</Row> : null}
          {tx.voided && pair ? <Row label="Kim to'g'riladi">{personName(pair.createdBy)}</Row> : null}
          {isCorrection && tx.correctReason ? <Row label="Sabab">{tx.correctReason}</Row> : null}
          {tx.related ? (
            <Row label="Bog'liq yozuv">
              {pair ? (
                <button type="button" className="font-bold text-primary" onClick={() => onSelect(pair)}>
                  #{tx.related.seq} →
                </button>
              ) : (
                `#${tx.related.seq}`
              )}
            </Row>
          ) : null}
          {tx.studentId ? (
            <Row label="O'quvchi">
              <Link href={`/students/${tx.studentId}`} className="font-bold text-primary">
                {tx.party || "O'quvchi"} →
              </Link>
            </Row>
          ) : null}
        </div>

        <div className="flex gap-3">
          {tx.status === 'PENDING' ? (
            <Can permission="transaction.create">
              <NmButton variant="soft" className="flex-1 text-[#5b6b82]" onClick={() => setWithdrawing(true)}>
                Yozuvni qaytarib olish
              </NmButton>
            </Can>
          ) : null}
          {tx.status === 'RETURNED' ? (
            <Can permission="transaction.create">
              <NmButton variant="soft" className="flex-1 text-[#5b6b82]" onClick={() => onEdit(tx, 'edit')}>
                Tuzatib qayta yuborish
              </NmButton>
            </Can>
          ) : null}
          {tx.status === 'ACTIVE' && !frozen ? (
            <Can permission="transaction.correct">
              <NmButton
                variant="soft"
                className="flex-1 text-[#5b6b82]"
                onClick={() => (tx.studentId ? setRefunding(true) : setCorrecting(true))}
              >
                {tx.studentId ? 'Pulni qaytarish' : "Xatoni to'g'rilash"}
              </NmButton>
            </Can>
          ) : null}
          <NmButton variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>
            Yopish
          </NmButton>
        </div>
      </div>

      <CorrectDialog
        open={correcting}
        onOpenChange={setCorrecting}
        tx={tx}
        onReenter={(source) => { onOpenChange(false); onEdit(source, 'copy'); }}
      />
      <RefundDialog open={refunding} onOpenChange={setRefunding} tx={tx} />
      <ConfirmDialog
        open={withdrawing}
        onOpenChange={setWithdrawing}
        title="Yozuvni qaytarib olish"
        message="Bu yozuv kassa qoldig'iga tegmagan — qaytarib olsangiz ham hech narsa o'zgarmaydi. Tarixda «qaytarib olindi» bo'lib qoladi."
        confirmLabel="Qaytarib olish"
        tone="soft"
        pending={withdraw.isPending}
        onConfirm={async () => {
          await withdraw.mutateAsync(tx.id);
          setWithdrawing(false);
          onOpenChange(false);
        }}
      />
    </NmDialog>
  );
}
