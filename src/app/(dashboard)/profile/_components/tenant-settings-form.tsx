"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { useTenantSettings } from "@/lib/hooks/use-tenant-settings";
import { tenantApi } from "@/lib/api/tenant";
import { NmCard } from "@/components/ui/nm-card";
import { NmSwitch } from "@/components/ui/nm-switch";
import type { TenantSettings } from "@/lib/types/tenant";

type BoolKey = "teacherOnlyMode" | "parentNotify" | "parentsEnabled" | "studentsEnabled";

const ROWS: { key: BoolKey; label: string; hint: string }[] = [
  { key: "teacherOnlyMode", label: "O'qituvchi rejimi", hint: "Menyu faqat kundalik ish (guruh, davomat, jadval, vazifa) bilan cheklanadi." },
  { key: "parentNotify", label: "Ota-onaga bildirishnoma", hint: "To'lov va davomat hodisalarida ota-onaga xabar tayyorlanadi." },
  { key: "parentsEnabled", label: "Ota-ona kabineti", hint: "Ota-onalar uchun login/parol berish yoqiladi." },
  { key: "studentsEnabled", label: "O'quvchi kabineti", hint: "O'quvchilar uchun portal yoqiladi." },
];

/** Owner-only tenant mode toggles (rendered on the profile page). */
export function TenantSettingsForm() {
  const { user } = useAuth();
  const { data } = useTenantSettings();
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (patch: Partial<TenantSettings>) => tenantApi.updateSettings(patch),
    onSuccess: (fresh) => { qc.setQueryData(["tenant-settings"], fresh); },
  });

  const isAdmin = !!user?.isSuperAdmin || ["Administrator", "Egasi"].includes(user?.defaultRole ?? "");
  if (!isAdmin) return null;

  return (
    <NmCard className="p-5">
      <div className="mb-1 text-[15px] font-extrabold text-foreground">Markaz sozlamalari</div>
      <p className="mb-4 text-[12.5px] font-medium text-muted">Rejim almashtirgichlari — faqat markaz egasi uchun.</p>
      <div className="flex flex-col gap-3">
        {ROWS.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4 rounded-[14px] bg-background px-4 py-3 shadow-nm-inset-sm">
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-foreground">{r.label}</div>
              <div className="text-[12px] text-muted">{r.hint}</div>
            </div>
            <NmSwitch
              checked={!!data?.[r.key]}
              disabled={mut.isPending || !data}
              aria-label={r.label}
              onCheckedChange={(v) => mut.mutate({ [r.key]: v } as Partial<TenantSettings>)}
            />
          </div>
        ))}
      </div>
      {mut.isError ? <p className="mt-3 text-[12px] font-semibold text-danger">Saqlashda xatolik</p> : null}
      {mut.isSuccess ? <p className="mt-3 text-[12px] font-semibold text-success">Saqlandi ✓</p> : null}
    </NmCard>
  );
}
