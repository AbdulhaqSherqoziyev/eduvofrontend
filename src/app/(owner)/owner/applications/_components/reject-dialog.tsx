'use client';

import { useState } from 'react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { useReject } from '@/lib/hooks/use-owner-applications';

/** Small dialog to reject an application with a reason. */
export function RejectDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const reject = useReject();

  const onReject = async () => {
    if (reason.trim().length < 3) return;
    await reject.mutateAsync({ id, reason });
    setOpen(false);
  };

  return (
    <NmDialog open={open} onOpenChange={setOpen} title="Arizani rad etish"
      trigger={<NmButton type="button" variant="soft">Rad etish</NmButton>}>
      <NmTextarea placeholder="Rad etish sababi..." value={reason} onChange={(e) => setReason(e.target.value)} />
      <div className="mt-5 flex gap-3">
        <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor</NmButton>
        <NmButton type="button" className="flex-[1.4]" onClick={onReject} disabled={reject.isPending}>Rad etish</NmButton>
      </div>
    </NmDialog>
  );
}
