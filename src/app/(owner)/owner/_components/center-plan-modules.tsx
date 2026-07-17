"use client";

import { useState } from "react";
import { NmButton } from "@/components/ui/nm-button";
import { NmSelect } from "@/components/ui/nm-select";
import { NmSwitch } from "@/components/ui/nm-switch";
import { FieldLabel } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { MODULES } from "@/lib/constants/modules";
import { usePlans } from "@/lib/hooks/use-owner-plans";
import { useOverride } from "@/lib/hooks/use-owner-tenants";
import type { OwnerTenant } from "@/lib/types/owner";

/** Owner assigns a center's tariff + toggles per-center modules (beyond the plan). */
export function CenterPlanModules({ tenant }: { tenant: OwnerTenant }) {
  const sub = tenant.subscription!;
  const { data: plans } = usePlans();
  const [planId, setPlanId] = useState(sub.planId ?? "");
  const [modules, setModules] = useState<string[]>(sub.modules ?? []);
  const override = useOverride(tenant.id);
  const toggle = (k: string) => setModules((m) => (m.includes(k) ? m.filter((x) => x !== k) : [...m, k]));

  return (
    <div className="flex flex-col gap-3 border-t border-[rgba(122,134,153,0.18)] pt-4">
      <div>
        <FieldLabel>TARIF</FieldLabel>
        <NmSelect value={planId} onChange={(e) => setPlanId(e.target.value)}>
          <option value="">Tarifsiz</option>
          {(plans ?? []).map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </NmSelect>
      </div>
      <div>
        <FieldLabel>MODULLAR (yoqish / o&apos;chirish)</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
          {MODULES.map((m) => (
            <div key={m.key} className="flex items-center justify-between gap-3">
              <span className={cn("text-[12.5px] font-bold", modules.includes(m.key) ? "text-primary" : "text-muted")}>{m.label}</span>
              <NmSwitch checked={modules.includes(m.key)} onCheckedChange={() => toggle(m.key)} />
            </div>
          ))}
        </div>
      </div>
      <NmButton type="button" variant="soft"
        onClick={() => override.mutate({ planId: planId || undefined, modules })}
        disabled={override.isPending}>
        Tarif va modullarni saqlash
      </NmButton>
    </div>
  );
}
