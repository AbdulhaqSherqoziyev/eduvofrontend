'use client';

import { useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { useApprove } from '@/lib/hooks/use-owner-applications';
import { RejectDialog } from './reject-dialog';
import type { OwnerApplication, ProvisionResult } from '@/lib/types/owner';

/** One pending application — approve (provisions a center + shows the generated
 *  director login) or reject. */
export function ApplicationCard({ app }: { app: OwnerApplication }) {
  const approve = useApprove();
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const onApprove = async () => setResult(await approve.mutateAsync(app.id));

  return (
    <NmCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[16px] font-bold text-foreground">{app.centerName}</div>
          <div className="text-[13px] text-muted">{app.directorName} · {app.phone}</div>
          <div className="mt-1 text-[12.5px] text-[#9aa6b8]">
            manzil: {app.requestedSlug}
            {app.region ? ` · ${app.region}` : ''}
            {app.studentsCount ? ` · ${app.studentsCount} o'quvchi` : ''}
          </div>
        </div>
        {!result ? (
          <div className="flex flex-shrink-0 gap-2">
            <RejectDialog id={app.id} />
            <NmButton type="button" onClick={onApprove} disabled={approve.isPending}>Tasdiqlash</NmButton>
          </div>
        ) : null}
      </div>
      {result ? (
        <div className="mt-4 rounded-ctl bg-[rgba(63,178,127,0.12)] px-4 py-3 text-[13px]">
          <div className="font-bold text-foreground">Markaz yaratildi ✓ — direktorga bering:</div>
          <div className="mt-1 font-bold text-[#2f7d57]">
            Telefon: {result.loginPhone} · Parol: {result.password}
          </div>
        </div>
      ) : null}
    </NmCard>
  );
}
