'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, PauseCircle, Pencil } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { formatNumber } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import type { OwnerModule } from '@/lib/api/owner-modules';
import { ModuleDialog } from './module-dialog';
import * as T from './labels';

/** One catalogue row: price, impact numbers, sale state. No inline editing. */
export function ModuleCard({ module: m, nameOf }: { module: OwnerModule; nameOf: (key: string) => string }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const flashSaved = () => {
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 4000);
  };

  return (
    <NmCard className="flex flex-col p-[18px]" data-module={m.key}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[16px] font-extrabold leading-[1.3] text-foreground [overflow-wrap:anywhere]">
            {m.nameUz}
          </div>
          <div className="mt-1 font-mono text-[11.5px] font-semibold text-[#9aa6b8]">{m.key}</div>
        </div>
        <NmIconButton aria-label="Tahrirlash" title="Tahrirlash" onClick={() => setOpen(true)}>
          <Pencil className="size-[15px]" strokeWidth={2} />
        </NmIconButton>
      </div>

      <div className="mt-3">
        {m.isCore ? (
          <div className="text-[14px] font-bold text-success">{T.CORE_TITLE}</div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[21px] font-extrabold text-primary">{formatNumber(m.monthlyFee)}</span>
            <span className="text-[12.5px] font-semibold text-muted">so&apos;m/oy</span>
          </div>
        )}
      </div>

      <div className="mt-3 h-px bg-[rgba(163,177,198,0.22)]" />

      <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 text-[12.5px] font-bold text-[#5b6b82]">
        {m.tenantCount === 0 ? (
          <span>{T.NOT_ENABLED}</span>
        ) : (
          <>
            <span>{T.enabledCount(m.tenantCount)}</span>
            {/* A core module has no price — "0 so'm/oy" would only add noise. */}
            {m.isCore ? null : (
              <>
                <span className="hidden text-[#9aa6b8] min-[380px]:inline">·</span>
                <span className="w-full min-[380px]:w-auto">{T.revenuePerMonth(m.monthlyRevenue)}</span>
              </>
            )}
          </>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={
            m.isActive
              ? 'flex items-center gap-1.5 text-[12.5px] font-bold text-success'
              : 'flex items-center gap-1.5 text-[12.5px] font-bold text-warning'
          }
        >
          {m.isActive ? (
            <Check className="size-[15px] flex-shrink-0" strokeWidth={2.4} />
          ) : (
            <PauseCircle className="size-[15px] flex-shrink-0" strokeWidth={2.2} />
          )}
          {m.isActive ? T.ON_SALE : T.RETIRED}
        </span>
        <span className="hidden text-[12px] text-[#9aa6b8] min-[380px]:inline">·</span>
        <span className="text-[12px] font-medium text-muted">{T.lastChanged(formatDate(m.updatedAt))}</span>
      </div>

      {saved ? (
        <div className="mt-2.5 text-[12.5px] font-bold text-success">{T.SAVED_ROW}</div>
      ) : null}

      <ModuleDialog
        module={m}
        open={open}
        onOpenChange={setOpen}
        nameOf={nameOf}
        onSaved={flashSaved}
      />
    </NmCard>
  );
}
