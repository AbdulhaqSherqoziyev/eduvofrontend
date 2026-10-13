"use client";

import { DoorOpen, Trash2 } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmIconButton } from "@/components/ui/nm-icon-button";
import { Can } from "@/components/shared/can";
import { useDeleteRoom } from "@/lib/hooks/use-rooms";
import type { Room } from "@/lib/types/room";
import { EditRoomDialog } from "./edit-room-dialog";

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <NmCard inset className="flex flex-1 flex-col items-center gap-1 py-3">
      <span className="text-[20px] font-extrabold text-foreground">{value}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">{label}</span>
    </NmCard>
  );
}

/** Single room card. */
export function RoomCard({ room }: { room: Room }) {
  const remove = useDeleteRoom();
  const onDelete = () => {
    if (window.confirm(`"${room.name}" xonasini o‘chirilsinmi?`)) remove.mutate(room.id);
  };

  return (
    <NmCard className="flex flex-col gap-5 p-[22px]">
      <div className="flex items-start gap-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-background text-primary shadow-nm-sm">
          <DoorOpen className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-extrabold tracking-[-0.3px] text-foreground">{room.name}</p>
          <p className="truncate text-[13px] font-semibold text-muted">{room.note || "Izoh yo‘q"}</p>
        </div>
        <div className="flex gap-2">
          <Can permission="room.update">
            <EditRoomDialog room={room} />
          </Can>
          <Can permission="room.delete">
            <NmIconButton tone="danger" onClick={onDelete} disabled={remove.isPending} aria-label="O‘chirish">
              <Trash2 className="size-4" />
            </NmIconButton>
          </Can>
        </div>
      </div>
      <div className="flex gap-2.5">
        <Stat value={room.capacity ?? "—"} label="O‘RIN" />
        <Stat value={room.groupCount} label="GURUH" />
      </div>
    </NmCard>
  );
}
