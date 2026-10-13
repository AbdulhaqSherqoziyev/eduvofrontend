'use client';

import { useState } from 'react';
import { Check, Clock, Plus } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { cn } from '@/lib/utils/cn';
import { formatNumber } from '@/lib/utils/format';
import type { ModuleSource, TenantModule } from '@/lib/types/module';

interface ModuleCardProps {
  module: TenantModule;
  showPrices: boolean;
  trialDaysLeft: number;
  /** 4-second ring on the card that just moved between sections. */
  highlight?: boolean;
  onToggle: (module: TenantModule, enable: boolean) => void;
}

const ICONS: Record<Exclude<ModuleSource, null>, { Icon: typeof Check; cls: string }> = {
  core: { Icon: Check, cls: 'text-success' },
  addon: { Icon: Check, cls: 'text-success' },
  plan: { Icon: Check, cls: 'text-primary' },
  grandfather: { Icon: Check, cls: 'text-primary' },
  trial: { Icon: Clock, cls: 'text-warning' },
};

/** Status line, driven only by `source` — never by isCore/monthlyFee (§B.3.3). */
function statusOf(module: TenantModule, trialDaysLeft: number): { label: string; cls: string } {
  if (!module.enabled) return { label: 'Yoqilmagan', cls: 'text-muted' };
  switch (module.source) {
    case 'core':
      return { label: 'Doim yoqilgan', cls: 'text-success' };
    case 'plan':
      return { label: 'Tarifga kiritilgan', cls: 'text-primary' };
    case 'trial':
      return { label: `Sinovda ochiq — ${trialDaysLeft} kun qoldi`, cls: 'text-warning' };
    default:
      return { label: 'Yoqilgan', cls: 'text-success' };
  }
}

/**
 * Price column.
 *
 * THE rule (§0.3): a number on screen must be a number the center actually
 * pays. A plan module's catalogue price is money nobody is charged, so it reads
 * as a hidden fee — the words replace it. A trial module shows no number at all
 * for the same reason.
 */
function priceOf(module: TenantModule, showPrices: boolean): string | null {
  const listed = showPrices && module.monthlyFee > 0 ? `${formatNumber(module.monthlyFee)} so'm/oy` : null;
  if (!module.enabled) return listed;
  switch (module.source) {
    case 'core':
      return 'Kiritilgan';
    case 'plan':
      return "Qo'shimcha to'lovsiz";
    case 'grandfather':
      return "Sizga qo'shimcha to'lovsiz";
    case 'trial':
      return null;
    default:
      return listed; // addon — the one enabled case that is genuinely billed
  }
}

/** One module in the "Tarif va modullar" grid. */
export function ModuleCard({
  module,
  showPrices,
  trialDaysLeft,
  highlight,
  onToggle,
}: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status = statusOf(module, trialDaysLeft);
  const price = priceOf(module, showPrices);
  const { Icon, cls } = module.enabled && module.source ? ICONS[module.source] : { Icon: Plus, cls: 'text-muted' };

  return (
    <NmCard
      className={cn(
        'flex flex-col p-[18px] transition-shadow duration-300',
        highlight && 'shadow-[0_0_0_2px_rgba(46,107,230,0.45)]',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-[34px] shrink-0 items-center justify-center rounded-[11px] bg-background shadow-nm-inset-sm',
            cls,
          )}
        >
          <Icon className="size-[17px]" strokeWidth={2.4} />
        </div>
        <h3 className="min-w-0 flex-1 text-[15px] font-extrabold leading-[1.35] text-foreground">
          {module.nameUz}
        </h3>
      </div>

      {/* Core modules skip the benefit: the center already uses them daily, so
          selling them back is noise (§B.3.1). */}
      {module.source !== 'core' ? (
        <div className="mt-2.5">
          <p
            className={cn(
              'text-[12.5px] font-medium leading-[1.5] text-[#5b6b82]',
              !expanded && 'line-clamp-2',
            )}
          >
            {module.benefitUz}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[12px] font-bold text-primary"
          >
            {expanded ? 'Yashirish' : 'Batafsil'}
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] font-bold">
        <span className={status.cls}>{status.label}</span>
        {price ? (
          <>
            <span className="text-muted">·</span>
            <span className="text-muted">{price}</span>
          </>
        ) : null}
      </div>

      {module.source === 'trial' ? (
        <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-muted">
          Sinovdan keyin yopiladi — ma&apos;lumot saqlanadi, istalgan vaqtda yoqasiz.
        </p>
      ) : null}

      {/* Retired = ERS stopped selling it, but it keeps working here. No button:
          switching it off is a one-way door (it can never be re-selected). */}
      {module.retired ? (
        <p className="mt-2 text-[12px] font-semibold text-muted">
          Yangi markazlar uchun sotuvda emas
        </p>
      ) : null}

      {!module.enabled ? (
        <NmButton
          size="sm"
          className="mt-4 h-[44px] w-full sm:h-[38px] sm:w-auto sm:self-end"
          onClick={() => onToggle(module, true)}
        >
          Yoqish
        </NmButton>
      ) : module.canDisable ? (
        <NmButton
          variant="danger"
          size="sm"
          className="mt-4 h-[44px] w-full sm:h-[38px] sm:w-auto sm:self-end"
          onClick={() => onToggle(module, false)}
        >
          O&apos;chirish
        </NmButton>
      ) : null}
    </NmCard>
  );
}
