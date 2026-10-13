'use client';

import { Check } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from '@/lib/constants/contact';
import {
  BUNDLE_LABELS,
  BUNDLE_ORDER,
  type ModuleBundle,
  type TenantModule,
} from '@/lib/types/module';

/**
 * Group the open modules by workflow, catalogue order preserved inside each.
 * Anything with an unknown or missing bundle falls into one trailing group —
 * a module must never disappear because the catalogue gained a new grouping.
 */
interface BundleGroup {
  key: string;
  /** null = the trailing catch-all group, rendered without a heading. */
  label: string | null;
  items: TenantModule[];
}

function groupByBundle(modules: TenantModule[]): BundleGroup[] {
  const groups: BundleGroup[] = BUNDLE_ORDER.map((b) => ({
    key: b,
    label: BUNDLE_LABELS[b],
    items: modules.filter((m) => m.bundle === b),
  }));
  const known = new Set<string>(BUNDLE_ORDER);
  const rest = modules.filter((m) => !m.bundle || !known.has(m.bundle as ModuleBundle));
  if (rest.length) groups.push({ key: '_rest', label: null, items: rest });
  return groups.filter((g) => g.items.length > 0);
}

/**
 * Every center that predates modular pricing lands here — which makes this the
 * highest-traffic screen of the whole feature the week it ships.
 *
 * They lost nothing, so the page says exactly that and nothing more: no price,
 * no button, no "all N of N" counter, no upgrade offer. The names stay because a
 * page titled "Tarif va modullar" that shows one sentence invites the question
 * "so what do I actually have?". The phone row is the only exit: a read-only
 * screen with no way to reach anyone reads as "we forgot about you" (§B.4).
 */
export function GrandfatherView({ modules }: { modules: TenantModule[] }) {
  const groups = groupByBundle(modules.filter((m) => m.enabled));

  return (
    <div className="flex flex-col gap-5">
      <NmCard className="flex items-center gap-4 p-[22px]">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-background text-success shadow-nm-inset-sm">
          <Check className="size-5" strokeWidth={2.6} />
        </div>
        <p className="text-[16px] font-extrabold leading-[1.4] text-foreground">
          Sizning tarifingizda barcha bo&apos;limlar ochiq.
        </p>
      </NmCard>

      <div className="px-1 text-[11px] font-bold uppercase tracking-[0.9px] text-muted">
        BO&apos;LIMLAR
      </div>
      <NmCard className="flex flex-col gap-5 p-[20px]">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-3">
            {group.label ? (
              <div className="text-[11px] font-bold uppercase tracking-[0.9px] text-[#9aa6b8]">
                {group.label}
              </div>
            ) : null}
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((m) => (
                <div key={m.key} className="flex items-center gap-2.5">
                  <Check className="size-4 shrink-0 text-success" strokeWidth={2.6} />
                  <span className="text-[13.5px] font-semibold text-foreground">{m.nameUz}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </NmCard>

      <p className="flex min-h-[36px] flex-wrap items-center gap-x-1.5 px-1 text-[12.5px] font-semibold text-muted">
        Savol bo&apos;lsa qo&apos;ng&apos;iroq qiling:
        <a href={SUPPORT_PHONE_HREF} className="font-bold text-primary">
          {SUPPORT_PHONE}
        </a>
      </p>
    </div>
  );
}
