'use client';

import { useState } from 'react';
import { Building2, GraduationCap } from 'lucide-react';
import { CenterSelect } from '@/components/owner/center-select';
import { cn } from '@/lib/utils/cn';
import { FinanceOverviewCards } from './finance-overview';
import { PlatformTxnTable } from './platform-txn-table';
import { TenantTxnTable } from './tenant-txn-table';

type World = 'platform' | 'tenant';

const TABS: { key: World; label: string; icon: typeof Building2 }[] = [
  { key: 'platform', label: 'Owner ↔ Markaz', icon: Building2 },
  { key: 'tenant', label: "Markaz ↔ O'quvchi", icon: GraduationCap },
];

/** Toggle between the two money worlds; filter by center; show feed + totals. */
export function TransactionsPanel() {
  const [world, setWorld] = useState<World>('platform');
  const [tenantId, setTenantId] = useState('');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 rounded-[18px] bg-background p-1.5 shadow-nm-inset-sm">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setWorld(key)}
              className={cn(
                'flex items-center gap-2 rounded-[13px] px-4 py-2.5 text-[13px] font-bold transition-shadow',
                world === key ? 'bg-primary text-white shadow-nm-sm' : 'text-muted',
              )}>
              <Icon className="size-4" strokeWidth={2.2} />{label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-[230px]"><CenterSelect value={tenantId} onChange={setTenantId} /></div>
      </div>
      <FinanceOverviewCards world={world} tenantId={tenantId} />
      {world === 'platform'
        ? <PlatformTxnTable tenantId={tenantId} />
        : <TenantTxnTable tenantId={tenantId} />}
    </div>
  );
}
