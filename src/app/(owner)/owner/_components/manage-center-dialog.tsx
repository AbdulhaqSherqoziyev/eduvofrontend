'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { FieldLabel } from '@/components/ui/label';
import { formatSom } from '@/lib/utils/format';
import { useArchiveCenter, useOverride, useSetStatus, useTopup, useUpdateCenter } from '@/lib/hooks/use-owner-tenants';
import { SUB_STATUS_META, type OwnerTenant, type SubStatus } from '@/lib/types/owner';

const STATUSES: SubStatus[] = ['TRIAL', 'ACTIVE', 'GRACE', 'SUSPENDED', 'CANCELLED'];

/** OWNER center controls: rename, top-up, status, pricing override, archive. */
export function ManageCenterDialog({ tenant }: { tenant: OwnerTenant }) {
  const sub = tenant.subscription!;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [discount, setDiscount] = useState(String(sub.discountPercent ?? 0));
  const [monthly, setMonthly] = useState(sub.customMonthlyFee != null ? String(sub.customMonthlyFee) : '');
  const [name, setName] = useState(tenant.name);
  const [domain, setDomain] = useState(tenant.domain ?? '');
  const [confirmArch, setConfirmArch] = useState(false);
  const topup = useTopup(tenant.id);
  const setStatus = useSetStatus(tenant.id);
  const override = useOverride(tenant.id);
  const update = useUpdateCenter(tenant.id);
  const archive = useArchiveCenter();

  const onTopup = async () => {
    const a = Number(amount);
    if (a > 0) { await topup.mutateAsync({ amount: a }); setAmount(''); }
  };
  const onOverride = () =>
    override.mutate({ discountPercent: Number(discount) || 0, customMonthlyFee: monthly ? Number(monthly) : undefined });

  return (
    <NmDialog open={open} onOpenChange={setOpen} title={tenant.name}
      trigger={<NmIconButton aria-label="Boshqarish"><Settings2 className="size-[15px]" strokeWidth={2} /></NmIconButton>}>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between rounded-ctl bg-background px-4 py-3 shadow-nm-inset-sm">
          <span className="text-[13px] font-semibold text-muted">Balans · {SUB_STATUS_META[sub.status].label}</span>
          <span className="text-[15px] font-bold">{formatSom(sub.balance)}</span>
        </div>
        <div>
          <FieldLabel>NOMI / DOMEN</FieldLabel>
          <div className="flex gap-2">
            <NmInput value={name} onChange={(e) => setName(e.target.value)} />
            <NmInput placeholder="domen.uz" value={domain} onChange={(e) => setDomain(e.target.value)} />
            <NmButton type="button" variant="soft" onClick={() => update.mutate({ name, domain })} disabled={update.isPending}>Saqlash</NmButton>
          </div>
        </div>
        <div>
          <FieldLabel>BALANSNI TO&apos;LDIRISH</FieldLabel>
          <div className="flex gap-2">
            <NmInput inputMode="numeric" placeholder="500000" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <NmButton type="button" onClick={onTopup} disabled={topup.isPending}>To&apos;ldirish</NmButton>
          </div>
        </div>
        <div>
          <FieldLabel>HOLAT</FieldLabel>
          <NmSelect value={sub.status} onChange={(e) => setStatus.mutate(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{SUB_STATUS_META[s].label}</option>)}
          </NmSelect>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>OYLIK (maxsus)</FieldLabel>
            <NmInput inputMode="numeric" placeholder={String(sub.effectiveMonthlyFee)} value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          </div>
          <div>
            <FieldLabel>CHEGIRMA %</FieldLabel>
            <NmInput inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
        </div>
        <NmButton type="button" variant="soft" onClick={onOverride} disabled={override.isPending}>Narxni saqlash</NmButton>
        <div className="border-t border-[rgba(122,134,153,0.18)] pt-4">
          {confirmArch ? (
            <div className="flex items-center gap-3">
              <span className="flex-1 text-[12.5px] font-semibold text-danger">Arxivlansinmi? (keyin tiklasa bo&apos;ladi)</span>
              <NmButton type="button" variant="soft" size="sm" onClick={() => setConfirmArch(false)}>Yo&apos;q</NmButton>
              <NmButton type="button" variant="danger" size="sm"
                onClick={() => archive.mutate(tenant.id, { onSuccess: () => setOpen(false) })} disabled={archive.isPending}>Ha, arxivla</NmButton>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmArch(true)} className="text-[12.5px] font-bold text-danger">Markazni arxivlash</button>
          )}
        </div>
      </div>
    </NmDialog>
  );
}
