'use client';
/** Muted bottom of every tab (§2.7) + "Meni hisobga olma" dialog (§2.8). */
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import type { MetaResponse, StatusResponse, WebSite } from '@/lib/api/owner-analytics.types';
import { fmtInt } from './format';
import { SITE_LABEL, SITE_URL } from './labels';
import { InfoNote } from './states';
import { useAnalyticsFilters } from './use-analytics-filters';

function botsText(meta: MetaResponse | undefined, site: string): string | null {
  if (!meta || site === 'erp') return null;
  const web = meta.sites.filter((s) => s.site !== 'erp' && !s.forbidden && s.botFiltered !== null);
  if (site === 'all') {
    if (!web.length) return null;
    return `${web.map((s) => `${SITE_LABEL[s.site]}: ${fmtInt(s.botFiltered!)}`).join(' · ')} ta bot filtrlandi`;
  }
  const one = web.find((s) => s.site === site);
  if (!one) return null;
  return one.botFiltered ? `Bu davrda ${fmtInt(one.botFiltered)} ta bot filtrlandi` : 'Bu davrda bot filtrlanmadi';
}

export function OptOutDialog({ open, onOpenChange, status }: { open: boolean; onOpenChange: (o: boolean) => void; status?: StatusResponse }) {
  const urlOf = (s: WebSite) => (status?.sites.find((x) => x.site === s)?.siteUrl || SITE_URL[s]).replace(/\/+$/, '');
  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title="Meni hisobga olma" className="max-w-[520px]">
      <div className="flex flex-col gap-4">
        <p className="text-[13.5px] font-medium leading-[1.55] text-foreground">
          Shu brauzerdan qilingan tashriflar analitikaga qo&apos;shilmaydi. Har bir sayt uchun bir marta bosing — sayt yangi oynada ochiladi va eslab qoladi.
        </p>
        <ul className="flex flex-col gap-3">
          {(['landing', 'mock'] as WebSite[]).map((s) => (
            <li key={s} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="w-[120px] flex-shrink-0 text-[13px] font-bold text-foreground">{SITE_LABEL[s]}</span>
              <NmButton asChild variant="soft" size="sm">
                <a href={`${urlOf(s)}/?_an=off`} target="_blank" rel="noopener noreferrer">Hisobga olma <ExternalLink className="size-3.5" aria-hidden /></a>
              </NmButton>
              <NmButton asChild variant="ghost" size="sm" className="h-auto px-0 py-1">
                <a href={`${urlOf(s)}/?_an=on`} target="_blank" rel="noopener noreferrer">Qayta hisobga olish</a>
              </NmButton>
            </li>
          ))}
        </ul>
        <p className="text-[12.5px] font-medium text-muted">ERP&apos;da sizning hisobingiz hech qachon sanalmaydi.</p>
        <p className="text-[12.5px] font-medium text-muted">Boshqa saytlardagi holat shu yerda ko&apos;rinmaydi. Qayta bosish zararsiz.</p>
        <div className="flex justify-end">
          <NmButton variant="soft" onClick={() => onOpenChange(false)}>Yopish</NmButton>
        </div>
      </div>
    </NmDialog>
  );
}

export function AnalyticsFooter({ meta, status }: { meta?: MetaResponse; status?: StatusResponse }) {
  const { site, tab } = useAnalyticsFilters();
  const [open, setOpen] = useState(false);
  const bots = tab === 'live' ? null : botsText(meta, site);
  return (
    <footer className="flex flex-col gap-1.5 pb-2 pt-1">
      <InfoNote>
        Raqamlar cookie&apos;siz sanaladi: bir odam boshqa qurilma yoki tarmoqdan kirsa, alohida sanaladi. Reklama bloklovchisi bor brauzerlar ko&apos;rinmaydi.
      </InfoNote>
      <p className="flex flex-wrap items-center gap-x-1.5 text-[12px] font-medium text-muted">
        <span>Barcha vaqtlar Toshkent vaqtida</span>
        {bots ? <><span aria-hidden>·</span><span>{bots}</span></> : null}
        <span aria-hidden>·</span>
        <NmButton variant="ghost" size="sm" className="h-auto px-0 py-0 text-[12px] underline-offset-2 hover:underline" onClick={() => setOpen(true)}>
          Meni hisobga olma
        </NmButton>
      </p>
      <OptOutDialog open={open} onOpenChange={setOpen} status={status} />
    </footer>
  );
}
