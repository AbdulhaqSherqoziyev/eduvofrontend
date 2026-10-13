"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { NmDialog } from "@/components/ui/nm-dialog";
import { NmButton } from "@/components/ui/nm-button";
import { useGenerateCredentials } from "@/lib/hooks/use-students";
import type { CredentialRow } from "@/lib/types/student";

function downloadCsv(rows: CredentialRow[]) {
  const head = ["O'quvchi", "Login", "Parol", "Ota-ona login", "Ota-ona parol"];
  const body = rows.map((r) =>
    [r.studentName, r.studentLogin, r.studentPassword, r.parentLogin ?? "", r.parentPassword ?? ""]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
  const blob = new Blob(["﻿" + [head.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "login-parollar.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Generate logins/passwords for students (+ optional parents) and export CSV. */
export function CredentialsDialog() {
  const [open, setOpen] = useState(false);
  const [withParents, setWithParents] = useState(true);
  const [result, setResult] = useState<CredentialRow[] | null>(null);
  const gen = useGenerateCredentials();

  const onGenerate = async () => {
    const rows = await gen.mutateAsync({ includeParents: withParents });
    setResult(rows);
    if (rows.length) downloadCsv(rows);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) setResult(null); }}
      title="Login/parol yaratish"
      trigger={<NmButton variant="soft"><KeyRound className="size-[18px]" strokeWidth={2.4} />Login/parol</NmButton>}
    >
      <div className="flex flex-col gap-4">
        <p className="text-[12.5px] font-medium text-muted">
          Hali login berilmagan o'quvchilarga login va parol yaratiladi va CSV (Excel) fayl yuklab olinadi.
          Parollar faqat shu yerda bir marta ko'rsatiladi.
        </p>
        <label className="flex items-center gap-2.5 text-[13px] font-bold text-foreground">
          <input type="checkbox" checked={withParents} onChange={(e) => setWithParents(e.target.checked)} className="size-4" />
          Ota-onalar uchun ham yaratilsin
        </label>
        {result != null ? (
          <p className="text-[13px] font-bold text-success">
            {result.length} ta yangi login yaratildi {result.length ? "(CSV yuklandi ✓)" : "— barchasida login bor edi"}
          </p>
        ) : null}
        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Yopish</NmButton>
          <NmButton type="button" className="flex-[1.4]" onClick={onGenerate} disabled={gen.isPending}>
            {gen.isPending ? "..." : "Yaratish va yuklash"}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
