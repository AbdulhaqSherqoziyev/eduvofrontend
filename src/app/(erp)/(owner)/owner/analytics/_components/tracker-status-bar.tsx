'use client';
/** Tracker health chips (§2.6): last event, silence warning (click → popover), "not started yet". */
import { useEffect, useRef, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/shared/skeleton';
import { StatusPill } from '@/components/shared/status-pill';
import type { SiteStatus, StatusResponse } from '@/lib/api/owner-analytics.types';
import { fmtAgo } from './format';
import { SITE_LABEL } from './labels';

function SilentChip({ s }: { s: SiteStatus }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    const onDown = (e: MouseEvent | TouchEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); document.removeEventListener('touchstart', onDown); };
  }, [open]);
  const popId = `silent-${s.site}`;
  return (
    <span ref={box} className="relative">
      <button ref={btn} type="button" aria-expanded={open} aria-controls={popId} onClick={() => setOpen((o) => !o)} className="rounded-full">
        <StatusPill tone="warning" icon={<AlertTriangle className="size-[14px]" aria-hidden />}
          label={`${SITE_LABEL[s.site]} · ${s.silentHours ?? s.thresholdHours} soatdan beri hodisa yo'q`} />
      </button>
      {open ? (
        <span id={popId} role="note" className="absolute left-0 top-full z-20 mt-1.5 flex w-[260px] flex-col gap-2 rounded-[12px] bg-background px-3 py-2.5 text-[12.5px] font-medium text-foreground shadow-nm">
          Tracker ishlamayotgan bo&apos;lishi mumkin. Saytni ochib tekshiring.
          <a href={s.siteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-primary">
            Saytni ochish <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </span>
      ) : null}
    </span>
  );
}

export function TrackerStatusBar({ query, count }: { query: UseQueryResult<StatusResponse, unknown>; count: number }) {
  if (query.isLoading) {
    return <div className="flex flex-wrap gap-2">{Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-[32px] w-[260px] max-w-full" />)}</div>;
  }
  if (!query.data) return <p className="text-[12px] font-medium text-muted">Tracker holatini olib bo&apos;lmadi</p>;
  const now = Date.parse(query.data.serverNow) || Date.now();
  return (
    <div className="flex flex-wrap gap-2">
      {query.data.sites.filter((s) => !s.forbidden).map((s) => {
        if (!s.trackingSince) {
          return <StatusPill key={s.site} tone="muted" label={`${SITE_LABEL[s.site]} · Kuzatuv hali boshlanmagan`} />;
        }
        if (s.silent) return <SilentChip key={s.site} s={s} />;
        return (
          <span key={s.site} className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-[12px] font-semibold text-muted shadow-nm-inset-sm">
            <CheckCircle2 className="size-[14px] text-success" aria-hidden />
            {SITE_LABEL[s.site]} · Oxirgi hodisa: {s.lastEventAt ? fmtAgo(s.lastEventAt, now) : '—'}
          </span>
        );
      })}
    </div>
  );
}
