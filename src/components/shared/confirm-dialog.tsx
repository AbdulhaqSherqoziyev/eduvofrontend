'use client';

import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** What will actually happen, in the user's words — not "Are you sure?". */
  message: string;
  confirmLabel: string;
  /**
   * `danger` for anything that moves or unwinds money; `soft` when the dialog's
   * own text says nothing changes — a red button beside "nothing changes"
   * contradicts the sentence above it and leaves the reader unsure which to
   * believe [SV4].
   */
  tone?: 'danger' | 'soft';
  pending?: boolean;
  /** Shown above the buttons when the action failed. Dialog stays open. */
  error?: string;
  onConfirm: () => void;
}

/** Confirmation step for a destructive action, in the neomorphic dialog shell. */
export function ConfirmDialog({
  open, onOpenChange, title, message, confirmLabel, tone = 'danger', pending, error, onConfirm,
}: ConfirmDialogProps) {
  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex flex-col gap-5">
        <p className="text-[13px] font-medium text-muted">{message}</p>
        {error ? <p className="text-[11.5px] font-semibold text-foreground">{error}</p> : null}
        <div className="flex gap-3">
          <NmButton variant="soft" className="flex-1" disabled={pending} onClick={() => onOpenChange(false)}>
            Yopish
          </NmButton>
          <NmButton
            variant={tone}
            className={`flex-[1.4] ${tone === 'soft' ? 'text-[#5b6b82]' : ''}`}
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
