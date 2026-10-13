"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { NmDialog } from "@/components/ui/nm-dialog";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { NmTextarea } from "@/components/ui/nm-textarea";
import { FieldLabel } from "@/components/ui/label";
import { useCreateRoom } from "@/lib/hooks/use-rooms";
import { roomSchema, type RoomFormValues } from "./room-schema";

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[12px] font-semibold text-danger">{msg}</p>;
}

/** Dialog to create a new room (room.create). */
export function AddRoomDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateRoom();
  const { register, handleSubmit, reset, formState } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: "", capacity: undefined, note: "" },
  });
  const { errors } = formState;

  const onSubmit = async (values: RoomFormValues) => {
    await create.mutateAsync(values);
    reset();
    setOpen(false);
  };

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title="Yangi xona"
      trigger={
        <NmButton>
          <Plus className="size-5" strokeWidth={2.4} />
          Yangi xona
        </NmButton>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <FieldLabel>NOMI</FieldLabel>
          <NmInput placeholder="Masalan: 101-xona" {...register("name")} />
          <Err msg={errors.name?.message} />
        </div>
        <div>
          <FieldLabel>SIG‘IMI (O‘RIN)</FieldLabel>
          <NmInput type="number" inputMode="numeric" placeholder="12" {...register("capacity")} />
          <Err msg={errors.capacity?.message} />
        </div>
        <div>
          <FieldLabel>IZOH</FieldLabel>
          <NmTextarea rows={2} placeholder="Proyektor bor, 2-qavat..." {...register("note")} />
          <Err msg={errors.note?.message} />
        </div>
        <div className="mt-2 flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" onClick={() => setOpen(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="submit" className="flex-[1.4]" disabled={create.isPending}>
            {create.isPending ? "..." : "Qo‘shish"}
          </NmButton>
        </div>
      </form>
    </NmDialog>
  );
}
