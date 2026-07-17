'use client';

import { useState } from 'react';
import { Settings2, Pencil, Wallet, SlidersHorizontal, Boxes, ChevronRight } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { FieldLabel } from '@/components/ui/label';
import { formatSom } from '@/lib/utils/format';
import { useArchiveCenter, useOverride, useSetStatus, useTopup, useUpdateCenter } from '@/lib/hooks/use-owner-tenants';
import { SUB_STATUS_META, type OwnerTenant, type SubStatus } from '@/lib/types/owner';
import { CenterPlanModules } from './center-plan-modules';

const STATUSES: SubStatus[] = ['TRIAL', 'ACTIVE', 'GRACE', 'SUSPENDED', 'CANCELLED'];

type Section = 'name' | 'topup' | 'pricing' | 'plan';

const SECTIONS: { key: Section; label: string; hint: string; icon: typeof Pencil }[] = [
  { key: 'name', label: 'Markaz nomi', hint: 'Nomini o‘zgartirish', icon: Pencil },
  { key: 'topup', label: 'Balansni to‘ldirish', hint: 'Naqd, karta yoki chegirma', icon: Wallet },
  { key: 'pricing', label: 'Holat va narx', hint: 'Holat, maxsus oylik, chegirma %', icon: SlidersHorizontal },
  { key: 'plan', label: 'Tarif va modullar', hint: 'Tarif tanlash, modullarni yoqish', icon: Boxes },
];

/** OWNER center controls hub — each section opens its own compact modal. */
export function ManageCenterDialog({ tenant }: { tenant: OwnerTenant }) {
  const sub = tenant.subscription!;
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section | null>(null);
  const [confirmArch, setConfirmArch] = useState(false);
  const archive = useArchiveCenter();

  return (
    <>
      <NmDialog open={open} onOpenChange={setOpen} title={tenant.name}
        trigger={<NmIconButton aria-label="Boshqarish"><Settings2 className="size-[15px]" strokeWidth={2} /></NmIconButton>}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-ctl bg-background px-4 py-3.5 shadow-nm-inset-sm">
            <span className="text-[13px] font-semibold text-muted">Balans · {SUB_STATUS_META[sub.status].label}</span>
            <span className="text-[16px] font-extrabold">{formatSom(sub.balance)}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {SECTIONS.map((s) => (
              <button key={s.key} type="button" onClick={() => setSection(s.key)}
                className="flex items-center gap-3.5 rounded-ctl bg-background px-4 py-3.5 text-left shadow-nm-sm nm-pressable">
                <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[12px] text-primary shadow-nm-inset-sm">
                  <s.icon className="size-[17px]" strokeWidth={2} />
                </span>
                <span className="flex-1">
                  <span className="block text-[13.5px] font-bold text-foreground">{s.label}</span>
                  <span className="block text-[11.5px] font-medium text-muted">{s.hint}</span>
                </span>
                <ChevronRight className="size-[16px] text-muted" strokeWidth={2.2} />
              </button>
            ))}
          </div>
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

      <NameDialog tenant={tenant} open={section === 'name'} onClose={() => setSection(null)} />
      <TopupDialog tenant={tenant} open={section === 'topup'} onClose={() => setSection(null)} />
      <PricingDialog tenant={tenant} open={section === 'pricing'} onClose={() => setSection(null)} />
      <NmDialog open={section === 'plan'} onOpenChange={(o) => !o && setSection(null)} title="Tarif va modullar">
        <CenterPlanModules tenant={tenant} />
      </NmDialog>
    </>
  );
}

function NameDialog({ tenant, open, onClose }: { tenant: OwnerTenant; open: boolean; onClose: () => void }) {
  const [name, setName] = useState(tenant.name);
  const update = useUpdateCenter(tenant.id);
  return (
    <NmDialog open={open} onOpenChange={(o) => !o && onClose()} title="Markaz nomi">
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>NOMI</FieldLabel>
          <NmInput value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <NmButton type="button" onClick={() => update.mutate({ name }, { onSuccess: onClose })} disabled={update.isPending}>Saqlash</NmButton>
      </div>
    </NmDialog>
  );
}

function TopupDialog({ tenant, open, onClose }: { tenant: OwnerTenant; open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const topup = useTopup(tenant.id);
  const onTopup = async () => {
    const a = Number(amount);
    if (a > 0) {
      await topup.mutateAsync({ amount: a, note: note || undefined, method });
      setAmount(''); setNote(''); onClose();
    }
  };
  return (
    <NmDialog open={open} onOpenChange={(o) => !o && onClose()} title="Balansni to‘ldirish">
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>SUMMA (SO&apos;M)</FieldLabel>
          <NmInput inputMode="numeric" placeholder="500000" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <FieldLabel>TO&apos;LOV USULI</FieldLabel>
          <NmSelect value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="CASH">Naqd</option>
            <option value="CARD">Kartadan</option>
            <option value="DISCOUNT">Chegirma</option>
          </NmSelect>
        </div>
        <div>
          <FieldLabel>IZOH (ixtiyoriy)</FieldLabel>
          <NmInput value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <NmButton type="button" onClick={onTopup} disabled={topup.isPending}>To&apos;ldirish</NmButton>
      </div>
    </NmDialog>
  );
}

function PricingDialog({ tenant, open, onClose }: { tenant: OwnerTenant; open: boolean; onClose: () => void }) {
  const sub = tenant.subscription!;
  const [discount, setDiscount] = useState(String(sub.discountPercent ?? 0));
  const [monthly, setMonthly] = useState(sub.customMonthlyFee != null ? String(sub.customMonthlyFee) : '');
  const setStatus = useSetStatus(tenant.id);
  const override = useOverride(tenant.id);
  return (
    <NmDialog open={open} onOpenChange={(o) => !o && onClose()} title="Holat va narx">
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>HOLAT</FieldLabel>
          <NmSelect value={sub.status} onChange={(e) => setStatus.mutate(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{SUB_STATUS_META[s].label}</option>)}
          </NmSelect>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel>OYLIK (maxsus)</FieldLabel>
            <NmInput inputMode="numeric" placeholder={String(sub.effectiveMonthlyFee)} value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          </div>
          <div>
            <FieldLabel>CHEGIRMA %</FieldLabel>
            <NmInput inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
        </div>
        <NmButton type="button"
          onClick={() => override.mutate(
            { discountPercent: Number(discount) || 0, customMonthlyFee: monthly ? Number(monthly) : undefined },
            { onSuccess: onClose },
          )}
          disabled={override.isPending}>
          Narxni saqlash
        </NmButton>
      </div>
    </NmDialog>
  );
}
