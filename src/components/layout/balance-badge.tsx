'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/providers/auth-provider';
import { billingApi, type BillingMe } from '@/lib/api/billing';

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

/**
 * Center balance shown in the dashboard top bar — RED when negative (the center
 * owes the setup fee / monthly fees). Only superadmin & admin see it; the
 * backend (GET /billing/me) returns 403 for everyone else, so we just hide it.
 */
export function BalanceBadge() {
  const { user } = useAuth();
  const [data, setData] = useState<BillingMe | null>(null);

  useEffect(() => {
    if (!user || user.isPlatform) return;
    let alive = true;
    billingApi.me().then((d) => { if (alive) setData(d); }).catch(() => {});
    return () => { alive = false; };
  }, [user]);

  if (!data) return null;
  const neg = data.balance < 0;
  return (
    <div
      className="flex flex-shrink-0 flex-col items-end rounded-[13px] bg-background px-[14px] py-[6px] shadow-nm-inset"
      title={neg ? "Balans manfiy — to'lov kerak" : 'Balans'}
    >
      <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#9aa6b8]">Balans</div>
      <div className={cn('text-[15px] font-extrabold leading-tight', neg ? 'text-danger' : 'text-foreground')}>
        {fmt(data.balance)} <span className="text-[10.5px] font-bold">so&apos;m</span>
      </div>
    </div>
  );
}
