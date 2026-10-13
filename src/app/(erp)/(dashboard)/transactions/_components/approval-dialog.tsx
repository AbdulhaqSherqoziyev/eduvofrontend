'use client';

import { useEffect, useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { Skeleton } from '@/components/shared/skeleton';
import { ErrorCard } from '@/components/shared/error-card';
import { useApproveEntry, useAskClarification, usePendingTransactions } from '@/lib/hooks/use-transactions';
import { useOnline } from '@/lib/hooks/use-online';
import { personName } from '@/lib/utils/tx-display';
import { EntryPreview } from './entry-preview';
import { ReasonChips } from '@/components/shared/reason-chips';

const REASONS = ['Summa boshqacha ko\'rsatilgan', 'Kategoriya boshqa', 'Hujjat yoki chek kerak'];
const OFFLINE = "Internet yo'q — tasdiq yuborilmadi. Aloqa tiklanganda qayta bosing.";

/**
 * §C.3 — the approval queue, one entry at a time.
 *
 * There is deliberately no "approve all": a bulk button turns the control into
 * a formality — the director stops reading and the threshold stops meaning
 * anything. Seeing them one by one forces each amount to be read, and leaves
 * exactly one primary action on the screen.
 */
export function ApprovalDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [mode, setMode] = useState<'view' | 'clarify'>('view');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [failure, setFailure] = useState('');

  const online = useOnline();
  const query = usePendingTransactions(open);
  const approve = useApproveEntry();
  const clarify = useAskClarification();
  const busy = approve.isPending || clarify.isPending;

  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setReviewed([]);
    setMode('view');
    setReason('');
    setNote('');
    setFailure('');
  }, [open]);

  const queue = (query.data ?? []).filter((t) => !reviewed.includes(t.id));
  const at = Math.min(idx, Math.max(0, queue.length - 1));
  const current = queue[at];

  const done = (id: string) => {
    setReviewed((prev) => [...prev, id]);
    setMode('view');
    setReason('');
    setNote('');
    setIdx((prev) => Math.max(0, Math.min(prev, queue.length - 2)));
  };

  const run = async (action: () => Promise<unknown>, id: string) => {
    setFailure('');
    if (!online) {
      setFailure(OFFLINE);
      return;
    }
    try {
      await action();
      done(id);
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      // Another director got there first — say so and move on rather than
      // leaving the same entry sitting in front of this one.
      if (status === 409) {
        setFailure('Bu yozuv allaqachon ko\'rib chiqilgan.');
        done(id);
        return;
      }
      setFailure(status === 403 ? "Bu amal uchun huquqingiz yo'q." : OFFLINE);
    }
  };

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title="Tasdiq kutilmoqda">
      {query.isLoading ? <Skeleton className="h-[180px] w-full" /> : null}
      {query.isError ? <ErrorCard onRetry={() => query.refetch()} /> : null}

      {query.data && !current ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-[14px] font-bold text-foreground">✓ Hammasi ko&apos;rib chiqildi.</p>
          <NmButton variant="soft" onClick={() => onOpenChange(false)}>
            Yopish
          </NmButton>
        </div>
      ) : null}

      {current ? (
        <div className="flex flex-col gap-5">
          <div className="text-right text-[12px] font-semibold text-muted">
            Yozuv #{current.seq} · {at + 1} / {queue.length}
          </div>
          <EntryPreview tx={current} />

          {mode === 'view' ? (
            <>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Kim yozdi', value: personName(current.createdBy) },
                  { label: 'Kimga', value: current.party || '—' },
                  { label: 'Izoh', value: current.note || '—' },
                ].map((r) => (
                  <div key={r.label} className="flex items-start justify-between gap-4 text-[13px]">
                    <span className="shrink-0 font-medium text-muted">{r.label}</span>
                    <span className="text-right font-bold text-foreground">{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11.5px] font-medium text-muted">Tasdiqlangach summa kassadan chiqadi.</p>
              {failure ? <p className="text-[11.5px] font-semibold text-foreground">{failure}</p> : null}
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <NmButton
                  variant="soft"
                  className="flex-1 text-[#5b6b82]"
                  disabled={busy}
                  onClick={() => { setMode('clarify'); setFailure(''); }}
                >
                  Aniqlik so&apos;rash
                </NmButton>
                <NmButton
                  className="flex-1"
                  disabled={busy}
                  onClick={() => run(() => approve.mutateAsync(current.id), current.id)}
                >
                  {approve.isPending ? 'Tasdiqlanmoqda…' : 'Tasdiqlash'}
                </NmButton>
              </div>
              {queue.length > 1 ? (
                <div className="flex items-center justify-center gap-2 text-[12.5px] font-bold text-primary">
                  <button
                    type="button"
                    disabled={at === 0}
                    className="min-h-[44px] px-3 disabled:opacity-40"
                    onClick={() => setIdx(at - 1)}
                  >
                    ‹ Oldingi
                  </button>
                  <span className="text-[#9aa6b8]">·</span>
                  <button
                    type="button"
                    disabled={at >= queue.length - 1}
                    className="min-h-[44px] px-3 disabled:opacity-40"
                    onClick={() => setIdx(at + 1)}
                  >
                    Keyingisi ›
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div>
                <p className="mb-2.5 text-[13px] font-bold text-foreground">Nima aniqlashtirish kerak?</p>
                <ReasonChips options={REASONS} value={reason} onChange={setReason} />
              </div>
              <div>
                <FieldLabel htmlFor="clarify-note">IZOH (IXTIYORIY)</FieldLabel>
                <NmTextarea
                  id="clarify-note"
                  rows={2}
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              {failure ? <p className="text-[11.5px] font-semibold text-foreground">{failure}</p> : null}
              <div className="flex gap-3">
                <NmButton variant="soft" className="flex-1" disabled={busy} onClick={() => setMode('view')}>
                  ‹ Orqaga
                </NmButton>
                <NmButton
                  className="flex-[1.4]"
                  disabled={busy || !reason}
                  onClick={() => run(
                    () => clarify.mutateAsync({ id: current.id, input: { reason, note: note.trim() || undefined } }),
                    current.id,
                  )}
                >
                  Yuborish
                </NmButton>
              </div>
            </>
          )}
        </div>
      ) : null}
    </NmDialog>
  );
}
