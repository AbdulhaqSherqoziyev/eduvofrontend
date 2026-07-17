"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { NmDialog } from "@/components/ui/nm-dialog";
import { NmButton } from "@/components/ui/nm-button";
import { NmIconButton } from "@/components/ui/nm-icon-button";
import { NmInput } from "@/components/ui/nm-input";
import { NmTextarea } from "@/components/ui/nm-textarea";
import { FieldLabel } from "@/components/ui/label";
import { useUpdateRoom } from "@/lib/hooks/use-rooms";
import type { Room } from "@/lib/types/room";
import { roomSchema, type RoomFormValues } from "./room-schema";

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[12px] font-semibold text-danger">{msg}</p>;
}

/** Edit an existing room (room.update). */
export function EditRoomDialog({ room }: { room: Room }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateRoom(room.id);
  const { register, handleSubmit, formState } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: room.name, capacity: room.capacity ?? undefined, note: room.note },
  });
  const { errors } = formState;

  const onSubmit = async (values: RoomFormValues) => {
    await update.mutateAsync(values);
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Xonani tahrirlash"
      trigger={
        <NmIconButton aria-label="Tahrirlash">
          <Pencil className="size-4" strokeWidth={2} />
        </NmIconButton>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <FieldLabel>NOMI</FieldLabel>
          <NmInput {...register("name")} />
          <Err msg={errors.name?.message} />
        </div>
        <div>
          <FieldLabel>SIG‘IMI (O‘RIN)</FieldLabel>
          <NmInput type="number" inputMode="numeric" {...register("capacity")} />
          <Err msg={errors.capacity?.message} />
        </div>
        <div>
          <FieldLabel>IZOH</FieldLabel>
          <NmTextarea rows={2} {...register("note")} />
          <Err msg={errors.note?.message} />
        </div>
        <div className="mt-2 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={update.isPending}>
            {update.isPending ? "..." : "Saqlash"}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
