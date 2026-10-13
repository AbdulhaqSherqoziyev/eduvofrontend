"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { NmDialog } from "@/components/ui/nm-dialog";
import { NmButton } from "@/components/ui/nm-button";
import { NmTextarea } from "@/components/ui/nm-textarea";
import { FieldLabel } from "@/components/ui/label";
import { useImportStudents } from "@/lib/hooks/use-students";
import type { ImportStudentRow } from "@/lib/types/student";

function parse(text: string): ImportStudentRow[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const c = line.split(/\t|,|;/).map((x) => x.trim());
      const age = c[3] ? parseInt(c[3].replace(/\D/g, ""), 10) : undefined;
      return { fullName: c[0] ?? "", phone: c[1] || undefined, gender: c[2] || undefined, age: Number.isNaN(age) ? undefined : age };
    })
    .filter((r) => r.fullName);
}

/** Bulk-import students by pasting Excel/notebook rows: FISH, tel, jins, yosh. */
export function ImportStudentsDialog() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const importMut = useImportStudents();
  const rows = parse(text);

  const onSubmit = async () => {
    if (!rows.length) return;
    const res = await importMut.mutateAsync(rows);
    setDone(res.created);
    setText("");
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) setDone(null); }}
      title="O'quvchilarni import qilish"
      trigger={<NmButton variant="soft"><Upload className="size-[18px]" strokeWidth={2.4} />Import</NmButton>}
    >
      <div className="flex flex-col gap-4">
        <p className="text-[12.5px] font-medium text-muted">
          Excel/daftardan nusxalab joylang. Har bir qatorda: <b>FISH, telefon, jins, yosh</b>
          (vergul yoki tab bilan). Masalan: <i>Ali Valiyev, +998901112233, erkak, 14</i>
        </p>
        <div>
          <FieldLabel>QATORLAR ({rows.length} ta o'quvchi)</FieldLabel>
          <NmTextarea rows={8} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={"Ali Valiyev, +998901112233, erkak, 14\nNodira Karimova, +998907778899, ayol, 13"} />
        </div>
        {done != null ? <p className="text-[13px] font-bold text-success">{done} ta o'quvchi qo'shildi ✓</p> : null}
        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Yopish</NmButton>
          <NmButton type="button" className="flex-[1.4]" onClick={onSubmit} disabled={!rows.length || importMut.isPending}>
            {importMut.isPending ? "..." : `${rows.length} tasini qo'shish`}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
