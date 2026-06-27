'use client';

import { NmSelect } from '@/components/ui/nm-select';
import { useOwnerTenants } from '@/lib/hooks/use-owner-tenants';

interface Props {
  value: string;
  onChange: (tenantId: string) => void;
  allLabel?: string;
  includeAll?: boolean;
}

/** Center picker for OWNER filters — "all centers" + every tenant. */
export function CenterSelect({ value, onChange, allLabel = 'Barcha markazlar', includeAll = true }: Props) {
  const { data } = useOwnerTenants();
  return (
    <NmSelect value={value} onChange={(e) => onChange(e.target.value)}>
      {includeAll
        ? <option value="">{allLabel}</option>
        : <option value="" disabled>Markazni tanlang</option>}
      {(data ?? []).map((t) => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </NmSelect>
  );
}
