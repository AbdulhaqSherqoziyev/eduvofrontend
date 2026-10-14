'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmInput } from '@/components/ui/nm-input';
import { NmSwitch } from '@/components/ui/nm-switch';
import { FieldLabel } from '@/components/ui/label';
import { useSavePromo } from '@/lib/hooks/use-owner-mock';
import type { MockPromo } from '@/lib/types/owner-mock';
import { mockErrorText } from './format';

/** Catalog skus (contract §3 price table). Empty selection = every product. */
const SKUS = ['ielts_section_1', 'ielts_full_1', 'ielts_pack_3', 'ielts_pack_5', 'ielts_pack_10', 'ielts_unlimited_30d', 'sat_section_1', 'sat_full_1', 'sat_pack_3', 'sat_pack_5', 'sat_pack_10', 'sat_unlimited_30d'];
const day = (iso: string | null) => (iso ? iso.slice(0, 10) : '');
const toIso = (d: string, end: boolean) => (d ? new Date(`${d}T${end ? '23:59:59' : '00:00:00'}`).toISOString() : null);

/** Create (no `promo`) or edit a promo code; the code itself is read-only once created. */
export function PromoDialog({ promo, open, onOpenChange }: { promo?: MockPromo; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [code, setCode] = useState(promo?.code ?? '');
  const [pct, setPct] = useState(String(promo?.percentOff ?? 10));
  const [skus, setSkus] = useState<string[]>(promo?.skus ?? []);
  const [max, setMax] = useState(promo?.maxRedemptions ? String(promo.maxRedemptions) : '');
  const [per, setPer] = useState(String(promo?.perLearnerLimit ?? 1));
  const [from, setFrom] = useState(day(promo?.validFrom ?? null));
  const [to, setTo] = useState(day(promo?.validTo ?? null));
  const [active, setActive] = useState(promo?.isActive ?? true);
  const [dsc, setDsc] = useState(promo?.providerDiscountId ?? '');
  const [err, setErr] = useState('');
  const save = useSavePromo(promo?.id);

  const p = Number(pct); const m = max.trim() ? Number(max) : null; const pl = Number(per);
  const errors = {
    code: !promo && !/^[A-Z0-9_-]{3,40}$/.test(code) ? "3–40 belgi: A–Z, 0–9, _ yoki -" : '',
    pct: !(Number.isInteger(p) && p >= 1 && p <= 100) ? '1 dan 100 gacha butun son' : '',
    max: m !== null && !(Number.isInteger(m) && m >= 1) ? 'Musbat butun son yoki bo‘sh' : '',
    per: !(Number.isInteger(pl) && pl >= 1 && pl <= 100) ? '1 dan 100 gacha' : '',
    dates: from && to && from > to ? 'Tugash sanasi boshlanishdan keyin bo‘lsin' : '',
    dsc: dsc.trim() && !/^dsc_[A-Za-z0-9]+$/.test(dsc.trim()) ? 'Paddle discount ID “dsc_…” ko‘rinishida' : '',
  };
  const ok = Object.values(errors).every((x) => !x);

  const submit = async () => {
    if (!ok) return;
    setErr('');
    try {
      await save.mutateAsync({
        ...(promo ? {} : { code }), percentOff: p, skus, maxRedemptions: m, perLearnerLimit: pl,
        validFrom: toIso(from, false), validTo: toIso(to, true), isActive: active, providerDiscountId: dsc.trim() || null,
      });
      onOpenChange(false);
    } catch (e) { setErr(mockErrorText(e)); }
  };
  const hint = (t: string) => (t ? <p className="mt-1 text-[11.5px] font-semibold text-danger">{t}</p> : null);

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title={promo ? `Promo: ${promo.code}` : 'Yangi promo kod'}
      trigger={<NmButton onClick={() => onOpenChange(true)}><Plus className="size-[18px]" strokeWidth={2.4} />Promo kod</NmButton>}>
      <form className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <div className="grid grid-cols-2 gap-3">
          <div><FieldLabel htmlFor="pr-code">Kod</FieldLabel><NmInput id="pr-code" value={code} readOnly={!!promo} onChange={(e) => setCode(e.target.value.toUpperCase().trim())} maxLength={40} />{hint(errors.code)}</div>
          <div><FieldLabel htmlFor="pr-pct">Chegirma, %</FieldLabel><NmInput id="pr-pct" inputMode="numeric" value={pct} onChange={(e) => setPct(e.target.value)} />{hint(errors.pct)}</div>
          <div><FieldLabel htmlFor="pr-max">Umumiy limit</FieldLabel><NmInput id="pr-max" inputMode="numeric" placeholder="Cheksiz" value={max} onChange={(e) => setMax(e.target.value)} />{hint(errors.max)}</div>
          <div><FieldLabel htmlFor="pr-per">Bir kishiga</FieldLabel><NmInput id="pr-per" inputMode="numeric" value={per} onChange={(e) => setPer(e.target.value)} />{hint(errors.per)}</div>
          <div><FieldLabel htmlFor="pr-from">Boshlanish</FieldLabel><NmInput id="pr-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><FieldLabel htmlFor="pr-to">Tugash</FieldLabel><NmInput id="pr-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />{hint(errors.dates)}</div>
        </div>
        <div>
          <FieldLabel>Mahsulotlar (hech biri tanlanmasa — hammasiga)</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {SKUS.map((s) => {
              const on = skus.includes(s);
              return (
                <button key={s} type="button" aria-pressed={on} onClick={() => setSkus(on ? skus.filter((x) => x !== s) : [...skus, s])}
                  className={`h-[32px] rounded-[10px] px-2.5 text-[12px] font-bold ${on ? 'bg-background text-primary shadow-nm-inset-sm' : 'bg-background text-muted shadow-nm-sm'}`}>{s}</button>
              );
            })}
          </div>
        </div>
        <div><FieldLabel htmlFor="pr-dsc">Paddle discount ID (ixtiyoriy)</FieldLabel><NmInput id="pr-dsc" value={dsc} onChange={(e) => setDsc(e.target.value)} placeholder="dsc_…" />{hint(errors.dsc)}
          <p className="mt-1 text-[11.5px] font-medium text-muted">Paddle (karta) to&apos;lovida promo ishlashi uchun shu chegirma Paddle&apos;da ham yaratilgan bo&apos;lishi kerak.</p></div>
        <label className="flex items-center justify-between gap-3 text-[13.5px] font-semibold text-foreground">Faol<NmSwitch checked={active} onCheckedChange={setActive} /></label>
        {err ? <p role="alert" className="rounded-[12px] bg-[rgba(228,87,76,0.10)] px-3 py-2 text-[12.5px] font-semibold text-danger">{err}</p> : null}
        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => onOpenChange(false)}>Bekor</NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={!ok || save.isPending}>{save.isPending ? '...' : 'Saqlash'}</NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
