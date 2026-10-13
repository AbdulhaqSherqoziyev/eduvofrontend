'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Phone } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { StatusPill } from '@/components/shared/status-pill';
import { useSendReminder, useSkipReminder } from '@/lib/hooks/use-reminders';
import { apiErrorMessage } from '@/lib/utils/api-error';
import { cn } from '@/lib/utils/cn';
import { formatSom } from '@/lib/utils/format';
import { STAGE_META, type Reminder } from '@/lib/types/reminder';

export const REMINDER_COLS =
  'grid min-w-[860px] grid-cols-[1.8fr_84px_1.1fr_2.1fr_258px] items-center gap-4';

type Mode = 'send' | 'skip';

/**
 * One debtor in the worklist.
 *
 * Two layouts from one state: a table row from `sm` up, stacked cards below it.
 * The mobile card is not decoration — this is a worklist, and a director
 * chasing debt from a phone must not have to scroll sideways to reach the
 * buttons the whole screen exists for.
 *
 * Both actions are confirmed one row at a time. Sending pushes a real message
 * to a real family and cannot be recalled, and skipping quietly removes the row
 * — neither belongs behind a single unguarded click.
 */
export function ReminderRow({ reminder }: { reminder: Reminder }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const send = useSendReminder();
  const skip = useSkipReminder();
  const stage = STAGE_META[reminder.stage];
  const busy = send.isPending || skip.isPending;

  const open = (next: Mode) => {
    setError(null);
    setMode(next);
  };

  const confirm = async () => {
    setError(null);
    try {
      if (mode === 'send') await send.mutateAsync(reminder.id);
      else await skip.mutateAsync(reminder.id);
      setMode(null);
    } catch (e) {
      setError(apiErrorMessage(e, "Amalni bajarib bo'lmadi. Qayta urinib ko'ring."));
    }
  };

  const name = (
    <Link href={`/students/${reminder.studentId}`} className="flex min-w-0 items-center gap-[13px]">
      <Avatar name={reminder.studentName} size={42} />
      <div className="truncate text-[14px] font-bold text-foreground hover:text-primary">
        {reminder.studentName}
      </div>
    </Link>
  );

  const stagePill = (
    <span title={stage.hint}>
      <StatusPill tone={stage.tone} label={stage.label} className="w-fit" />
    </span>
  );

  const amount = <div className="text-[14px] font-bold text-foreground">{formatSom(reminder.amount)}</div>;

  const telegram = reminder.tgLinked ? (
    <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-success">
      <Check className="size-[15px] shrink-0" strokeWidth={2.6} />
      Ulangan
    </div>
  ) : (
    // Half the centers have parents who never linked the bot. Without a number
    // here the row is a dead end and the debt just sits there.
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[12.5px] font-bold text-warning">Telegram ulanmagan</span>
      {reminder.phone ? (
        <a
          href={`tel:${reminder.phone.replace(/\s/g, '')}`}
          className="flex items-center gap-1.5 whitespace-nowrap text-[12px] font-semibold text-primary"
        >
          <Phone className="size-[13px] shrink-0" />
          Qo&apos;ng&apos;iroq qiling: {reminder.phone}
        </a>
      ) : (
        <span className="text-[12px] font-semibold text-muted">Telefon raqami yo&apos;q</span>
      )}
    </div>
  );

  // No bulk equivalent of these buttons exists anywhere in the app, by design.
  const actions = (full?: boolean) => (
    <>
      {reminder.tgLinked ? (
        <NmButton
          size="sm"
          className={cn('whitespace-nowrap', full && 'h-[44px] flex-1')}
          disabled={busy}
          onClick={() => open('send')}
        >
          Yuborish
        </NmButton>
      ) : null}
      <NmButton
        variant="soft"
        size="sm"
        className={cn('whitespace-nowrap', full && 'h-[44px] flex-1')}
        disabled={busy}
        onClick={() => open('skip')}
      >
        O&apos;tkazib yuborish
      </NmButton>
    </>
  );

  return (
    <>
      {/* Desktop / tablet: one table row */}
      <div
        className={cn(
          REMINDER_COLS,
          'hidden rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm sm:grid',
        )}
      >
        {name}
        {stagePill}
        {amount}
        {telegram}
        <div className="flex justify-end gap-2">{actions()}</div>
      </div>

      {/* Mobile: a stacked card — every action stays inside the viewport */}
      <div className="flex flex-col gap-3 border-b border-[rgba(163,177,198,0.22)] px-1 py-4 last:border-b-0 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          {name}
          {stagePill}
        </div>
        {amount}
        {telegram}
        <div className="flex gap-2.5">{actions(true)}</div>
      </div>

      <NmDialog
        open={mode !== null}
        onOpenChange={(next) => {
          if (busy) return;
          if (!next) setMode(null);
        }}
        title={
          mode === 'send'
            ? `«${reminder.studentName}» ga eslatma yuborilsinmi?`
            : `«${reminder.studentName}» eslatmasi o'tkazib yuborilsinmi?`
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] font-semibold leading-[1.55] text-foreground">
            {/* "Qarz" only from day 14 — the D3/D7 templates deliberately do not
                use the word, and the sender must picture what actually goes out. */}
            {mode === 'send'
              ? reminder.stage === 'D14'
                ? `Telegramga ${formatSom(reminder.amount)} qarz haqida eslatma darhol yuboriladi. Yuborilgan xabarni qaytarib bo'lmaydi.`
                : `Telegramga ${formatSom(reminder.amount)} to'lov haqida eslatma darhol yuboriladi. Yuborilgan xabarni qaytarib bo'lmaydi.`
              : "Bu eslatma ro'yxatdan chiqadi va yuborilmaydi. To'lov kelmasa, keyingi bosqichda yangi eslatma tayyorlanadi."}
          </p>
          {error ? <p className="text-[13px] font-bold text-danger">{error}</p> : null}
          <div className="mt-1 flex gap-3 max-[380px]:flex-col-reverse">
            <NmButton
              variant="soft"
              className="flex-[1.4]"
              autoFocus
              disabled={busy}
              onClick={() => setMode(null)}
            >
              Bekor qilish
            </NmButton>
            <NmButton
              /* Skipping is the kind choice — red would punish it. */
              variant={mode === 'send' ? 'primary' : 'soft'}
              className="flex-1"
              disabled={busy}
              onClick={confirm}
            >
              {busy
                ? 'Bajarilmoqda…'
                : mode === 'send'
                  ? 'Yuborish'
                  : "O'tkazib yuborish"}
            </NmButton>
          </div>
        </div>
      </NmDialog>
    </>
  );
}
