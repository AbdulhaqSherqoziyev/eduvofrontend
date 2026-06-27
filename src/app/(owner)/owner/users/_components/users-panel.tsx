'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { CenterSelect } from '@/components/owner/center-select';
import { UserDialog } from './user-dialog';
import { UsersTable } from './users-table';

/** Filters (center + search) and the add-user action above the table. */
export function UsersPanel() {
  const [tenantId, setTenantId] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-[230px]"><CenterSelect value={tenantId} onChange={setTenantId} /></div>
        <div className="flex-1">
          <NmInput icon={<Search className="size-[18px]" />} placeholder="Ism yoki telefon bo'yicha qidirish"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <UserDialog />
      </div>
      <UsersTable tenantId={tenantId} search={search} />
    </div>
  );
}
