"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { NmDialog } from "@/components/ui/nm-dialog";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { NmSelect } from "@/components/ui/nm-select";
import { FieldLabel } from "@/components/ui/label";
import { useGroupOptions } from "@/lib/hooks/use-groups";
import { useRoomAvailability } from "@/lib/hooks/use-rooms";
import { useCreateExtraLesson } from "@/lib/hooks/use-schedule";

function errMsg(e: unknown): string {
  const m = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(m) ? m.join(", ") : m ?? "Xatolik yuz berdi";
}

/** Teacher books an extra lesson: pick group + slot, room free/busy is checked. */
export function ExtraLessonDialog() {
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [roomId, setRoomId] = useState("");
  const [err, setErr] = useState("");
  const groups = useGroupOptions();
  const ready = !!date && !!start && !!end;
  const avail = useRoomAvailability(ready ? { date, start, end } : null);
  const create = useCreateExtraLesson();

  const reset = () => { setGroupId(""); setDate(""); setStart(""); setEnd(""); setRoomId(""); setErr(""); };
  const onSubmit = async () => {
    setErr("");
    if (!groupId || !ready) { setErr("Guruh, sana va vaqtni to‘ldiring"); return; }
    try {
      await create.mutateAsync({ groupId, date, startTime: start, endTime: end, roomId: roomId || undefined });
      reset();
      setOpen(false);
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}
      title="Qo'shimcha dars"
      trigger={
        <NmButton>
          <CalendarPlus className="size-[18px]" strokeWidth={2.4} />
          Qo&apos;shimcha dars
        </NmButton>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>SANA</FieldLabel>
          <NmInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>BOSHLANISHI</FieldLabel>
            <NmInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <FieldLabel>TUGASHI</FieldLabel>
            <NmInput type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div>
          <FieldLabel>XONA {ready ? "(bo‘sh / band)" : ""}</FieldLabel>
          <NmSelect value={roomId} onChange={(e) => setRoomId(e.target.value)} disabled={!ready}>
            <option value="">Xonasiz</option>
            {(avail.data ?? []).map((r) => (
              <option key={r.id} value={r.id} disabled={!r.free}>
                {r.name} {r.free ? "— bo‘sh" : "— band"}
              </option>
            ))}
          </NmSelect>
          {!ready ? <p className="mt-1.5 text-[12px] text-muted">Avval sana va vaqtni kiriting.</p> : null}
        </div>
        <div>
          <FieldLabel>GURUH</FieldLabel>
          <NmSelect value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">Guruhni tanlang...</option>
            {groups.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </NmSelect>
        </div>
        {err ? <p className="text-[12px] font-semibold text-danger">{err}</p> : null}
        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>Bekor qilish</NmButton>
          <NmButton type="button" className="flex-[1.4]" onClick={onSubmit} disabled={create.isPending}>
            {create.isPending ? "..." : "Dars qo‘shish"}
          </NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
