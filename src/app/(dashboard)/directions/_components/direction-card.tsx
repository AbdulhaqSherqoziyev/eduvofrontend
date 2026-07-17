"use client";

import { Compass, Trash2 } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmIconButton } from "@/components/ui/nm-icon-button";
import { Can } from "@/components/shared/can";
import { useDeleteSubject } from "@/lib/hooks/use-subjects";
import type { Subject } from "@/lib/types/subject";
import { EditDirectionDialog } from "./edit-direction-dialog";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <NmCard inset className="flex flex-1 flex-col items-center gap-1 py-3">
      <span className="text-[20px] font-extrabold text-foreground">{value}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">{label}</span>
    </NmCard>
  );
}

/** Single direction (subject) card — name, note, group/student stats. */
export function DirectionCard({ subject }: { subject: Subject }) {
  const remove = useDeleteSubject();

  const onDelete = () => {
    if (window.confirm(`"${subject.name}" yo‘nalishini o‘chirilsinmi?`)) remove.mutate(subject.id);
  };

  return (
    <NmCard className="flex flex-col gap-5 p-[22px]">
      <div className="flex items-start gap-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-background text-primary shadow-nm-sm">
          <Compass className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-extrabold tracking-[-0.3px] text-foreground">{subject.name}</p>
          <p className="line-clamp-2 text-[13px] font-semibold text-muted">{subject.note || "Izoh yo‘q"}</p>
        </div>
        <div className="flex gap-2">
          <Can permission="subject.update">
            <EditDirectionDialog subject={subject} />
          </Can>
          <Can permission="subject.delete">
            <NmIconButton tone="danger" onClick={onDelete} disabled={remove.isPending} aria-label="O‘chirish">
              <Trash2 className="size-4" />
            </NmIconButton>
          </Can>
        </div>
      </div>
      <div className="flex gap-2.5">
        <Stat value={subject.groupCount} label="GURUH" />
        <Stat value={subject.studentCount} label="O‘QUVCHI" />
      </div>
    </NmCard>
  );
}
