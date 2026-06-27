'use client';

import { Eye, RotateCcw } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/shared/status-pill';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { cn } from '@/lib/utils/cn';
import { formatSom } from '@/lib/utils/format';
import { ownerApi } from '@/lib/api/owner';
import { startImpersonation } from '@/lib/auth/impersonation';
import { useRestoreCenter } from '@/lib/hooks/use-owner-tenants';
import { SUB_STATUS_META, type OwnerTenant } from '@/lib/types/owner';
import { ManageCenterDialog } from './manage-center-dialog';

export const CENTER_COLS = 'grid grid-cols-[2.1fr_1.2fr_1.1fr_1.1fr_1fr_128px] items-center gap-4';

/** One center row — name, counts, fee, balance, status, login-as + manage. */
export function CenterRow({ tenant }: { tenant: OwnerTenant }) {
  const sub = tenant.subscription;
  const meta = sub ? SUB_STATUS_META[sub.status] : null;
  const balance = sub?.balance ?? 0;
  const restore = useRestoreCenter();

  const onImpersonate = async () => startImpersonation(await ownerApi.impersonateTenant(tenant.id));

  return (
    <div className={cn(CENTER_COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm',
      tenant.archived && 'opacity-55')}>
      <div className="flex min-w-0 items-center gap-[13px]">
        <Avatar name={tenant.name} size={42} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-foreground">{tenant.name}</div>
          <div className="text-[12px] font-semibold text-[#9aa6b8]">{tenant.slug}{tenant.archived ? ' · arxiv' : ''}</div>
        </div>
      </div>
      <div className="text-[12.5px] font-semibold text-[#5b6b82]">
        {tenant.studentCount} o&apos;quvchi · {tenant.userCount} xodim
      </div>
      <div className="text-[13.5px] font-bold text-foreground">{sub ? formatSom(sub.effectiveMonthlyFee) : '—'}</div>
      <div className={cn('text-[14px] font-bold', balance < 0 ? 'text-danger' : 'text-foreground')}>
        {formatSom(balance, { sign: balance < 0 })}
      </div>
      <div>{meta ? <StatusPill label={meta.label} tone={meta.tone} /> : <span className="text-[#9aa6b8]">—</span>}</div>
      <div className="flex justify-end gap-2">
        {tenant.archived ? (
          <NmIconButton aria-label="Tiklash" onClick={() => restore.mutate(tenant.id)} disabled={restore.isPending}>
            <RotateCcw className="size-[15px]" strokeWidth={2} />
          </NmIconButton>
        ) : (
          <>
            <NmIconButton aria-label="Kirish (login as)" onClick={onImpersonate}>
              <Eye className="size-[15px]" strokeWidth={2} />
            </NmIconButton>
            {sub ? <ManageCenterDialog tenant={tenant} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
