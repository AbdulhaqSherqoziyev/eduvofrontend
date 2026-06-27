'use client';

import { useState } from 'react';
import { Ban, Check, X } from 'lucide-react';
import { NmIconButton } from '@/components/ui/nm-icon-button';

/** Per-row "cancel (storno)" control with a two-step inline confirm. */
export function TxnVoidButton({ onVoid, pending }: { onVoid: () => void; pending?: boolean }) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <NmIconButton aria-label="Tasdiqlash" tone="danger" disabled={pending}
          onClick={() => { onVoid(); setConfirm(false); }}>
          <Check className="size-[15px]" strokeWidth={2.4} />
        </NmIconButton>
        <NmIconButton aria-label="Yopish" onClick={() => setConfirm(false)}>
          <X className="size-[15px]" strokeWidth={2.4} />
        </NmIconButton>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <NmIconButton aria-label="Bekor qilish (storno)" tone="danger" disabled={pending} onClick={() => setConfirm(true)}>
        <Ban className="size-[15px]" strokeWidth={2} />
      </NmIconButton>
    </div>
  );
}
