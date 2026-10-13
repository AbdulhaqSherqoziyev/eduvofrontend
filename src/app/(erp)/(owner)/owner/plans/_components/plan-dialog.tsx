"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil } from "lucide-react";
import { NmDialog } from "@/components/ui/nm-dialog";
import { NmButton } from "@/components/ui/nm-button";
import { NmIconButton } from "@/components/ui/nm-icon-button";
import { NmInput } from "@/components/ui/nm-input";
import { NmSwitch } from "@/components/ui/nm-switch";
import { FieldLabel } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { MODULES } from "@/lib/constants/modules";
import { useCreatePlan, useUpdatePlan } from "@/lib/hooks/use-owner-plans";
import type { OwnerPlan } from "@/lib/types/owner";

type V = {
  name: string; monthlyFee: string;
  minStudents: string; maxStudents: string; maxBranches: string;
};
const numOr = (s: string) => (s ? Number(s) : undefined);

/** Add or edit a platform plan: pricing, student range, branches, modules. */
export function PlanDialog({ plan }: { plan?: OwnerPlan }) {
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState<string[]>(plan?.modules ?? []);
  const create = useCreatePlan();
  const update = useUpdatePlan(plan?.id ?? "");
  const form = useForm<V>({
    defaultValues: {
      name: plan?.name ?? "", monthlyFee: String(plan?.monthlyFee ?? ""),
      minStudents: plan?.minStudents != null ? String(plan.minStudents) : "",
      maxStudents: plan?.maxStudents != null ? String(plan.maxStudents) : "",
      maxBranches: plan?.maxBranches != null ? String(plan.maxBranches) : "",
    },
  });
  const toggle = (k: string) => setModules((m) => (m.includes(k) ? m.filter((x) => x !== k) : [...m, k]));

  const onSubmit = form.handleSubmit(async (v) => {
    const payload = {
      name: v.name, monthlyFee: Number(v.monthlyFee) || 0, setupFee: 0,
      trialDays: 0, minStudents: numOr(v.minStudents), maxStudents: numOr(v.maxStudents),
      maxBranches: numOr(v.maxBranches), modules,
    };
    if (plan) await update.mutateAsync(payload);
    else await create.mutateAsync(payload);
    setOpen(false);
  });

  return (
    <NmDialog open={open} onOpenChange={setOpen} title={plan ? "Tarifni tahrirlash" : "Yangi tarif"}
      trigger={plan
        ? <NmIconButton aria-label="Tahrirlash"><Pencil className="size-[15px]" strokeWidth={2} /></NmIconButton>
        : <NmButton><Plus className="size-[18px]" strokeWidth={2.4} />Yangi tarif</NmButton>}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <p className="text-[12px] font-medium text-muted">O&apos;rnatish (ustanovka) narxi barcha tariflar uchun umumiy — «Umumiy o&apos;rnatish narxi» kartasidan belgilanadi.</p>
        <div><FieldLabel>NOMI</FieldLabel><NmInput {...form.register("name")} /></div>
        <div><FieldLabel>OYLIK</FieldLabel><NmInput inputMode="numeric" {...form.register("monthlyFee")} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><FieldLabel>O&apos;QUVCHI (dan)</FieldLabel><NmInput inputMode="numeric" {...form.register("minStudents")} /></div>
          <div><FieldLabel>(gacha)</FieldLabel><NmInput inputMode="numeric" {...form.register("maxStudents")} /></div>
          <div><FieldLabel>FILIAL (maks)</FieldLabel><NmInput inputMode="numeric" {...form.register("maxBranches")} /></div>
        </div>
        <div>
          <FieldLabel>MODULLAR</FieldLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
            {MODULES.map((m) => (
              <div key={m.key} className="flex items-center justify-between gap-3">
                <span className={cn("text-[12.5px] font-bold", modules.includes(m.key) ? "text-primary" : "text-muted")}>{m.label}</span>
                <NmSwitch checked={modules.includes(m.key)} onCheckedChange={() => toggle(m.key)} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor</NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={create.isPending || update.isPending}>Saqlash</NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
