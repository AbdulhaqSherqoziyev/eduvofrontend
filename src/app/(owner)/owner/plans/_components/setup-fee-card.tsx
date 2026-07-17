"use client";

import { useEffect, useState } from "react";
import { NmCard } from "@/components/ui/nm-card";
import { NmInput } from "@/components/ui/nm-input";
import { NmButton } from "@/components/ui/nm-button";
import { FieldLabel } from "@/components/ui/label";
import { ownerSettingsApi } from "@/lib/api/owner-settings";

/** Global one-time setup price — deducted on every new center (balance goes negative). */
export function SetupFeeCard() {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    ownerSettingsApi.getSetupFee().then((d) => setValue(d.value ? String(d.value) : ""));
  }, []);

  const save = async () => {
    setBusy(true); setSaved(false);
    try {
      const d = await ownerSettingsApi.setSetupFee(Number(value) || 0);
      setValue(d.value ? String(d.value) : "");
      setSaved(true);
    } finally { setBusy(false); }
  };

  return (
    <NmCard className="p-5">
      <FieldLabel>UMUMIY O&apos;RNATISH NARXI (USTANOVKA)</FieldLabel>
      <p className="mb-3 mt-1 text-[12.5px] font-medium text-muted">
        Har bir yangi markaz ochilganda shu summa balansidan yechiladi — balans minusga tushadi.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <NmInput inputMode="numeric" placeholder="1200000" value={value}
          onChange={(e) => { setValue(e.target.value); setSaved(false); }} className="max-w-[240px]" />
        <NmButton onClick={save} disabled={busy}>{busy ? "..." : "Saqlash"}</NmButton>
        {saved ? <span className="text-[13px] font-bold text-success">Saqlandi ✓</span> : null}
      </div>
    </NmCard>
  );
}
