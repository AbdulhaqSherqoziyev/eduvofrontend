'use client';
/**
 * One dialog shell for every owner action that changes money or credits: the consequence in plain
 * words, the form fields, the API error in Uzbek, Yopish / confirm. Stays open on error.
 */
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';

export function ActionDialog({ open, onOpenChange, title, message, confirmLabel, tone = 'danger', pending, error, disabled, onConfirm, children }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; message: string; confirmLabel: string;
  tone?: 'danger' | 'primary' | 'soft'; pending?: boolean; error?: string; disabled?: boolean; onConfirm: () => void; children?: React.ReactNode;
}) {
  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title={title}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (!disabled && !pending) onConfirm(); }}>
        <p className="text-[13px] font-medium text-muted">{message}</p>
        {children}
        {error ? <p role="alert" className="rounded-[12px] bg-[rgba(228,87,76,0.10)] px-3 py-2 text-[12.5px] font-semibold text-danger">{error}</p> : null}
        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" disabled={pending} onClick={() => onOpenChange(false)}>Yopish</NmButton>
          <NmButton type="submit" variant={tone} className="flex-[1.4]" disabled={pending || disabled}>{pending ? '...' : confirmLabel}</NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
