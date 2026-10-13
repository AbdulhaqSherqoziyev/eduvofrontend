"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NmDialog } from "@/components/ui/nm-dialog";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { NmTextarea } from "@/components/ui/nm-textarea";
import { NmSegmented } from "@/components/ui/nm-segmented";
import { FieldLabel } from "@/components/ui/label";
import { useStudents } from "@/lib/hooks/use-students";
import { useAcceptStudentPayment } from "@/lib/hooks/use-payments";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/types/payment";
import { formatSom } from "@/lib/utils/format";

/** Main "accept a payment from a student" flow (search student → amount + note). */
export function StudentPaymentDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [note, setNote] = useState("");
  const { data } = useStudents({ search, page: 1, limit: 6 });
  const accept = useAcceptStudentPayment();

  const reset = () => { setSearch(""); setPicked(null); setAmount(""); setNote(""); setMethod("CASH"); };
  const onSubmit = async () => {
    if (!picked || !amount) return;
    await accept.mutateAsync({ studentId: picked.id, amount: Number(amount), method, note: note || undefined });
    reset();
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}
      title="To'lov qabul qilish"
      trigger={
        <NmButton>
          <Plus className="size-[18px]" strokeWidth={2.4} />
          To&apos;lov qabul qilish
        </NmButton>
      }
    >
      <div className="flex flex-col gap-4">
        {picked ? (
          <div className="flex items-center gap-3 rounded-ctl bg-background p-[14px] shadow-nm-inset-sm">
            <Avatar name={picked.name} size={40} />
            <div className="min-w-0 flex-1 truncate text-[14px] font-bold text-foreground">{picked.name}</div>
            <NmButton variant="soft" size="sm" onClick={() => setPicked(null)}>O&apos;zgartirish</NmButton>
          </div>
        ) : (
          <div>
            <FieldLabel>O&apos;QUVCHI</FieldLabel>
            <NmInput icon={<Search className="size-[18px]" />} placeholder="Ism bo'yicha qidiring"
              value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="mt-2 flex max-h-[220px] flex-col gap-1.5 overflow-y-auto">
              {(data?.items ?? []).map((s) => (
                <button key={s.id} type="button" onClick={() => setPicked({ id: s.id, name: s.fullName })}
                  className="flex items-center gap-2.5 rounded-[12px] bg-background px-3 py-2 text-left shadow-nm-sm hover:shadow-nm-inset-sm">
                  <Avatar name={s.fullName} size={32} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-foreground">{s.fullName}</span>
                  <span className="text-[12px] font-semibold text-muted">{formatSom(s.balance)}</span>
                </button>
              ))}
              {search && (data?.items?.length ?? 0) === 0 ? (
                <p className="px-1 py-2 text-[12px] font-semibold text-muted">Topilmadi</p>
              ) : null}
            </div>
          </div>
        )}
        <div>
          <FieldLabel>SUMMA</FieldLabel>
          <NmInput type="number" inputMode="numeric" placeholder="500000" value={amount}
            onChange={(e) => setAmount(e.target.value)} className="text-[18px] font-extrabold text-primary" />
        </div>
        <div>
          <FieldLabel>TO&apos;LOV USULI</FieldLabel>
          <NmSegmented items={PAYMENT_METHODS} value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} />
        </div>
        <div>
          <FieldLabel>IZOH</FieldLabel>
          <NmTextarea rows={2} placeholder="Ixtiyoriy izoh" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor qilish</NmButton>
          <NmButton type="button" className="flex-[1.4]" onClick={onSubmit} disabled={!picked || !amount || accept.isPending}>
            {accept.isPending ? "..." : "Tasdiqlash"}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
