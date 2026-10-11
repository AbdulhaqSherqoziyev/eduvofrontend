"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { useTenantSettings } from "@/lib/hooks/use-tenant-settings";
import { tenantApi } from "@/lib/api/tenant";
import { NmCard } from "@/components/ui/nm-card";
import { NmSwitch } from "@/components/ui/nm-switch";
import { NmSelect } from "@/components/ui/nm-select";
import { NmInput } from "@/components/ui/nm-input";
import type { TenantSettings } from "@/lib/types/tenant";

type BoolKey = "teacherOnlyMode" | "parentNotify" | "parentsEnabled" | "studentsEnabled";

const ROWS: { key: BoolKey; label: string; hint: string }[] = [
  { key: "teacherOnlyMode", label: "O'qituvchi rejimi", hint: "Menyu faqat kundalik ish (guruh, davomat, jadval, vazifa) bilan cheklanadi." },
  { key: "parentNotify", label: "Ota-onaga bildirishnoma", hint: "To'lov va davomat hodisalarida ota-onaga xabar tayyorlanadi." },
  { key: "parentsEnabled", label: "Ota-ona kabineti", hint: "Ota-onalar uchun login/parol berish yoqiladi." },
  { key: "studentsEnabled", label: "O'quvchi kabineti", hint: "O'quvchilar uchun portal yoqiladi." },
];

/** §A.14 — preset scales; anything else is "Boshqa" with its own number field. */
const SCALE_PRESETS: { value: number; label: string }[] = [
  { value: 0, label: "Ballsiz — faqat bajardi / qilmadi" },
  { value: 5, label: "5 balli" },
  { value: 10, label: "10 balli" },
  { value: 100, label: "100 balli" },
];
const CUSTOM = "custom";

function HomeworkScaleRow({ value, disabled, onChange }: { value: number; disabled: boolean; onChange: (n: number) => void }) {
  const isPreset = SCALE_PRESETS.some((p) => p.value === value);
  const [custom, setCustom] = useState(!isPreset);
  const [draft, setDraft] = useState(isPreset ? "" : String(value));

  const commitCustom = () => {
    const n = Number(draft);
    if (draft === "" || !Number.isInteger(n) || n < 1 || n > 100 || n === value) return;
    onChange(n);
  };

  return (
    <div className="rounded-[14px] bg-background px-4 py-3 shadow-nm-inset-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold text-foreground">Baho shkalasi</div>
          <div className="text-[12px] text-muted">Uy vazifasi va dars bahosi uchun. Ballsiz — faqat bajardi/qilmadi va davomat.</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NmSelect
            aria-label="Baho shkalasi"
            className="h-[42px] w-[250px] max-w-full text-[13.5px]"
            disabled={disabled}
            value={custom ? CUSTOM : String(value)}
            onChange={(e) => {
              if (e.target.value === CUSTOM) {
                setCustom(true);
                setDraft(isPreset ? "" : String(value));
                return;
              }
              setCustom(false);
              onChange(Number(e.target.value));
            }}
          >
            {SCALE_PRESETS.map((p) => (
              <option key={p.value} value={String(p.value)}>{p.label}</option>
            ))}
            <option value={CUSTOM}>Boshqa — o&apos;zim kiritaman</option>
          </NmSelect>
          {custom ? (
            <NmInput
              inputMode="numeric"
              placeholder="Nechta ball"
              aria-label="Nechta ball"
              className="h-[42px] w-[120px] text-[13.5px]"
              disabled={disabled}
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 3))}
              onBlur={commitCustom}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          ) : null}
        </div>
      </div>
      <p className="mt-1.5 text-[12px] text-muted">Yangi vazifalarga qo&apos;llanadi, eski vazifalar o&apos;z shkalasida qoladi.</p>
    </div>
  );
}

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
        {data ? (
          <HomeworkScaleRow
            value={data.homeworkScale ?? 0}
            disabled={mut.isPending}
            onChange={(n) => mut.mutate({ homeworkScale: n })}
          />
        ) : null}
      </div>
      {mut.isError ? <p className="mt-3 text-[12px] font-semibold text-danger">Saqlashda xatolik</p> : null}
      {mut.isSuccess ? <p className="mt-3 text-[12px] font-semibold text-success">Saqlandi ✓</p> : null}
    </NmCard>
  );
}
