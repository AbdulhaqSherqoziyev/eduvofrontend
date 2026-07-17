"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NmDialog } from "@/components/ui/nm-dialog";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { FieldLabel } from "@/components/ui/label";
import { useCreateBranch } from "@/lib/hooks/use-branches";

/** Director creates a new branch (independent center under the same director). */
export function CreateBranchDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const create = useCreateBranch();

  const onSubmit = async () => {
    if (name.trim().length < 2) return;
    await create.mutateAsync({ name: name.trim(), brandName: brand.trim() || undefined });
    setName(""); setBrand(""); setOpen(false);
  };

  return (
    <NmDialog open={open} onOpenChange={setOpen} title="Yangi filial"
      trigger={<NmButton><Plus className="size-[18px]" strokeWidth={2.4} />Yangi filial</NmButton>}>
      <div className="flex flex-col gap-4">
        <p className="text-[12.5px] font-medium text-muted">
          Filial alohida mustaqil markaz bo&apos;ladi. Siz (direktor) unga ham xuddi shu login bilan kirasiz.
        </p>
        <div>
          <FieldLabel>RASMIY NOMI</FieldLabel>
          <NmInput value={name} onChange={(e) => setName(e.target.value)} placeholder="MChJ ..." />
        </div>
        <div>
          <FieldLabel>BREND NOMI (ixtiyoriy)</FieldLabel>
          <NmInput value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Eduvo — 2-filial" />
        </div>
        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor</NmButton>
          <NmButton type="button" className="flex-[1.4]" onClick={onSubmit} disabled={create.isPending}>
            {create.isPending ? "..." : "Yaratish"}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
