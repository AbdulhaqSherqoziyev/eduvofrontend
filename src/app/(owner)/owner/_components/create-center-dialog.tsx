'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { FieldLabel } from '@/components/ui/label';
import { cleanPhone } from '@/lib/utils/normalize';
import { usePlans } from '@/lib/hooks/use-owner-plans';
import { useCreateCenter } from '@/lib/hooks/use-owner-tenants';
import type { ProvisionResult } from '@/lib/types/owner';

type V = { centerName: string; directorName: string; phone: string; slug: string; planId: string };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

/** OWNER provisions a new center; shows the generated login on success. */
export function CreateCenterDialog() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const { data: plans } = usePlans();
  const create = useCreateCenter();
  const form = useForm<V>({ defaultValues: { centerName: '', directorName: '', phone: '+998 ', slug: '', planId: '' } });

  const close = () => { setOpen(false); setResult(null); form.reset(); };
  const onSubmit = form.handleSubmit(async (v) => {
    setResult(await create.mutateAsync({
      centerName: v.centerName, directorName: v.directorName, phone: cleanPhone(v.phone),
      slug: v.slug ? slugify(v.slug) : slugify(v.centerName), planId: v.planId || undefined,
    }));
  });

  return (
    <NmDialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())} title="Yangi markaz"
      trigger={<NmButton><Plus className="size-[18px]" strokeWidth={2.4} />Yangi markaz</NmButton>}>
      {result ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-ctl bg-background p-4 shadow-nm-inset-sm">
            <div className="text-[13px] font-bold text-success">Markaz yaratildi — kirish ma&apos;lumotlari:</div>
            <div className="mt-2 text-[13.5px] font-semibold text-foreground">Login: {result.loginPhone}</div>
            <div className="text-[13.5px] font-semibold text-foreground">
              Parol: <span className="font-extrabold text-primary">{result.password}</span>
            </div>
            <div className="mt-1 text-[12px] text-muted">Slug: {result.slug}</div>
          </div>
          <NmButton type="button" onClick={close}>Yopish</NmButton>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div><FieldLabel>MARKAZ NOMI</FieldLabel><NmInput {...form.register('centerName', { required: true })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><FieldLabel>DIREKTOR</FieldLabel><NmInput {...form.register('directorName', { required: true })} /></div>
            <div><FieldLabel>TELEFON</FieldLabel><NmInput {...form.register('phone')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><FieldLabel>SLUG (ixtiyoriy)</FieldLabel><NmInput placeholder="markaz-nomi" {...form.register('slug')} /></div>
            <div>
              <FieldLabel>TARIF</FieldLabel>
              <NmSelect {...form.register('planId')}>
                <option value="">Birinchi faol tarif</option>
                {(plans ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </NmSelect>
            </div>
          </div>
          <div className="mt-2 flex gap-3">
            <NmButton type="button" variant="soft" className="flex-1" onClick={close}>Bekor</NmButton>
            <NmButton type="submit" className="flex-[1.4]" disabled={create.isPending}>
              {create.isPending ? '...' : 'Yaratish'}
            </NmButton>
          </div>
        </form>
      )}
    </NmDialog>
  );
}
